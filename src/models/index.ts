import User from "./User";
import Prize from "./Prize";
import Redemption from "./Redemption";
import PointHistory from "./PointHistory";
import Activity from "./Activity";
import ActivityEntry from "./ActivityEntry";
import Notification from "./Notification";
import SocialMedia from "./SocialMedia";

// User associations
User.hasMany(Redemption, { foreignKey: "user_id", as: "redemptions" });
User.hasMany(PointHistory, { foreignKey: "user_id", as: "pointHistory" });
User.hasMany(ActivityEntry, { foreignKey: "user_id", as: "entries" });
User.hasMany(Notification, { foreignKey: "user_id", as: "notifications" });

// Prize associations
Prize.hasMany(Redemption, { foreignKey: "prize_id", as: "redemptions" });

// Redemption associations
Redemption.belongsTo(User, { foreignKey: "user_id", as: "user" });
Redemption.belongsTo(Prize, { foreignKey: "prize_id", as: "prize" });
Redemption.belongsTo(User, { foreignKey: "delivered_by", as: "delivered" });
// PointHistory associations
PointHistory.belongsTo(User, { foreignKey: "user_id", as: "user" });
PointHistory.belongsTo(User, { foreignKey: "assigned_by", as: "assigner" });

// Activity associations
Activity.hasMany(ActivityEntry, { foreignKey: "activity_id", as: "entries" });

// ActivityEntry associations
ActivityEntry.belongsTo(User, { foreignKey: "user_id", as: "user" });
ActivityEntry.belongsTo(Activity, {
  foreignKey: "activity_id",
  as: "activity",
});
ActivityEntry.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });

// Notification associations
Notification.belongsTo(User, { foreignKey: "user_id", as: "user" });
//Social Media
Activity.hasMany(SocialMedia, {
  foreignKey: "activity_id",
  as: "social_medias",
});

SocialMedia.belongsTo(Activity, {
  foreignKey: "activity_id",
  as: "activity",
});
export {
  User,
  Prize,
  Redemption,
  PointHistory,
  Activity,
  ActivityEntry,
  Notification,
};
