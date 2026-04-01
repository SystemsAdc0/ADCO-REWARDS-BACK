import { Response } from "express";
import { AuthRequest } from "../types";
import {
  User,
  Prize,
  Redemption,
  ActivityEntry,
  PointRequest,
} from "../models";
import sequelize from "../config/database";
import { Op, QueryTypes } from "sequelize";

export const getSummary = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const totalUsers = await User.count({ where: { role: "user" } });
    const totalPrizes = await Prize.count({ where: { status: "active" } });
    const totalRedemptions = await Redemption.count();
    const pendingEntries = await ActivityEntry.count({
      where: { status: "pending" },
    });
    const pendingRedemptions = await Redemption.count({
      where: { status: "pending" },
    });

    const pointsResult = await sequelize.query<{ total: string }>(
      'SELECT SUM(points) as total FROM users WHERE role = "user"',
      { type: QueryTypes.SELECT },
    );
    const totalPointsInCirculation = pointsResult[0]?.total || 0;

    res.json({
      totalUsers,
      totalPrizes,
      totalRedemptions,
      pendingEntries,
      pendingRedemptions,
      totalPointsInCirculation,
    });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getTopUsers = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.findAll({
      where: { role: { [Op.in]: ["user", "moderator"] }, status: "active" },
      attributes: { exclude: ["password"] },
      order: [["points", "DESC"]],
      limit: 10,
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getPendingCounts = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const role = req.user?.role;
    const userId = req.user?.id;

    let pendingEntries = 0;
    let pendingRedemptions = 0;
    let pendingPointRequests = 0;

    if (role === "admin" || role === "moderator") {
      pendingEntries = await ActivityEntry.count({
        where: { status: "pending" },
      });
      pendingRedemptions = await Redemption.count({
        where: { status: "pending" },
      });
    }

    if (userId) {
      pendingPointRequests = await PointRequest.count({
        where: { target_id: userId, status: "pending" },
      });
    }

    res.json({ pendingEntries, pendingRedemptions, pendingPointRequests });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getTopParticipants = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const results = await sequelize.query<{
      user_id: number;
      name: string;
      email: string;
      avatar: string;
      total_participations: number;
      approved: number;
      points_earned: number;
    }>(
      `SELECT
        u.id as user_id, u.name, u.email, u.avatar,
        COUNT(ae.id) as total_participations,
        SUM(CASE WHEN ae.status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN ae.status = 'approved' THEN a.points_reward ELSE 0 END) as points_earned
       FROM activity_entries ae
       JOIN users u ON ae.user_id = u.id
       JOIN activities a ON ae.activity_id = a.id
       WHERE u.role IN ('user', 'moderator') AND a.counts_for_travel = 1
       GROUP BY u.id, u.name, u.email, u.avatar
       ORDER BY approved DESC, total_participations DESC
       LIMIT 20`,
      { type: QueryTypes.SELECT },
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getParticipationsRanking = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const [totalActivities, ranking] = await Promise.all([
      sequelize.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM activities WHERE counts_for_travel = 1`,
        { type: QueryTypes.SELECT },
      ),
      sequelize.query<{
        user_id: number;
        name: string;
        avatar: string;
        participations: number;
        approved: number;
      }>(
        `SELECT
          u.id as user_id, u.name, u.avatar,
          COUNT(ae.id) as participations,
          SUM(CASE WHEN ae.status = 'approved' THEN 1 ELSE 0 END) as approved
         FROM activity_entries ae
         JOIN users u ON ae.user_id = u.id
         JOIN activities a ON ae.activity_id = a.id
         WHERE u.role IN ('user', 'moderator') AND a.counts_for_travel = 1
         GROUP BY u.id, u.name, u.avatar
         ORDER BY participations DESC
         LIMIT 10`,
        { type: QueryTypes.SELECT },
      ),
    ]);
    res.json({ total_activities: totalActivities[0]?.total ?? 0, ranking });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const isTopParticipant = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const [totalRow, userRow] = await Promise.all([
      sequelize.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM activities WHERE counts_for_travel = 1`,
        { type: QueryTypes.SELECT },
      ),
      sequelize.query<{ approved: number }>(
        `SELECT COUNT(*) as approved
         FROM activity_entries ae
         JOIN activities a ON ae.activity_id = a.id
         WHERE ae.user_id = :userId
           AND a.counts_for_travel = 1
           AND ae.status = 'approved'`,
        { type: QueryTypes.SELECT, replacements: { userId } },
      ),
    ]);

    const total = Number(totalRow[0]?.total ?? 0);
    const approved = Number(userRow[0]?.approved ?? 0);
    const isTop = total > 0 && approved / total >= 0.9;

    res.json({ isTop });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getUserMissingActivities = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.userId), 10);
    if (isNaN(userId)) {
      res.status(400).json({ message: "Invalid user id" });
      return;
    }
    const missing = await sequelize.query<{ id: number; title: string }>(
      `SELECT a.id, a.name
       FROM activities a
       LEFT JOIN activity_entries ae
         ON ae.activity_id = a.id AND ae.user_id = ? AND ae.status = 'approved'
       WHERE a.counts_for_travel = 1 AND ae.id IS NULL
       ORDER BY a.name ASC`,
      { type: QueryTypes.SELECT, replacements: [userId] },
    );
    res.json(missing);
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: "Error", error: err });
  }
};

export const getTopPrizes = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const prizes = await sequelize.query<{
      prize_id: number;
      name: string;
      total: number;
    }>(
      `SELECT r.prize_id, p.name, COUNT(r.id) as total
       FROM redemptions r JOIN prizes p ON r.prize_id = p.id
       GROUP BY r.prize_id, p.name ORDER BY total DESC LIMIT 10`,
      { type: QueryTypes.SELECT },
    );
    res.json(prizes);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
