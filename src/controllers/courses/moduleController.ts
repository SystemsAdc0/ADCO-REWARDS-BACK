import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import Module from "../../models/courses/Module";
import Course from "../../models/courses/Course";
import Section from "../../models/courses/Section";

export const getCourseModules = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.course_id) where.course_id = req.query.course_id;

    const modules = await Module.findAll({
      where,
      include: [{ model: Course, as: "course", attributes: ["id", "name"] }],
      order: [["sort_order", "ASC"]],
    });
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getCourseModuleById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const module = await Module.findByPk(String(req.params.id), {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "name"],
        },

        {
          model: Section,
          as: "sections",
        },
      ],

      order: [[{ model: Section, as: "sections" }, "sort_order", "ASC"]],
    });

    if (!module) {
      res.status(404).json({
        message: "Módulo no encontrado",
      });

      return;
    }

    res.json(module);
  } catch (err) {
    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

export const createCourseModule = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, introduction, image, course_id } = req.body;
    const course = await Course.findByPk(course_id);
    if (!course) {
      res.status(404).json({ message: "Curso no encontrado" });
      return;
    }
    const lastModule = await Module.findOne({
      where: { course_id },
      order: [["sort_order", "DESC"]],
    });

    const sort_order = lastModule ? lastModule.sort_order + 1 : 1;

    const module = await Module.create({
      name: name.trim(),
      introduction,
      image,
      course_id,
      sort_order,
    });
    res.status(201).json(module);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateCourseModule = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const module = await Module.findByPk(String(req.params.id));
    if (!module) {
      res.status(404).json({ message: "Módulo no encontrado" });
      return;
    }
    await module.update(req.body);
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reorderCourseModules = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { modules } = req.body;

    if (!Array.isArray(modules)) {
      res.status(400).json({
        message: "Formato inválido",
      });
      return;
    }

    for (const item of modules) {
      if (typeof item.id !== "number" || typeof item.sort_order !== "number") {
        res.status(400).json({
          message: "Datos inválidos",
        });
        return;
      }
    }

    await Promise.all(
      modules.map((modules) =>
        Module.update(
          {
            sort_order: modules.sort_order,
          },
          {
            where: {
              id: modules.id,
            },
          },
        ),
      ),
    );

    res.json({
      message: "Orden actualizado correctamente",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Error",
      error: err,
    });
  }
};

// Checar la relación si tiene ON DELETE
export const deleteCourseModule = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const module = await Module.findByPk(String(req.params.id));
    if (!module) {
      res.status(404).json({ message: "Módulo no encontrado" });
      return;
    }
    await module.destroy();
    res.json({ message: "Módulo eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
