import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import SectionContent from "../../models/courses/SectionContent";
import Section from "../../models/courses/Section";

export const getSectionContents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const where: Record<string, unknown> = {};
    if (req.query.section_id) where.section_id = req.query.section_id;

    const contents = await SectionContent.findAll({
      where,
      order: [["sort_order", "ASC"]],
    });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getSectionContentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const content = await SectionContent.findByPk(String(req.params.id));
    if (!content) {
      res.status(404).json({ message: "Enlace no encontrado" });
      return;
    }
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createSectionContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { link, type, section_id } = req.body;
    const section = await Section.findByPk(section_id);
    if (!section) {
      res.status(404).json({ message: "Sección no encontrada" });
      return;
    }
    const lastContent = await SectionContent.findOne({
      where: { section_id },
      order: [["sort_order", "DESC"]],
    });
    const sort_order = lastContent ? lastContent.sort_order + 1 : 1;
    const created = await SectionContent.create({
      link,
      type,
      section_id,
      sort_order,
    });
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateSectionContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const content = await SectionContent.findByPk(String(req.params.id));
    if (!content) {
      res.status(404).json({ message: "Enlace no encontrado" });
      return;
    }
    await content.update(req.body);
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const reorderSectionContet = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { contents } = req.body;

    if (!Array.isArray(contents)) {
      res.status(400).json({
        message: "Formato inválido",
      });
      return;
    }

    for (const item of contents) {
      if (typeof item.id !== "number" || typeof item.sort_order !== "number") {
        res.status(400).json({
          message: "Datos inválidos",
        });
        return;
      }
    }

    await Promise.all(
      contents.map((questions) =>
        SectionContent.update(
          {
            sort_order: questions.sort_order,
          },
          {
            where: {
              id: questions.id,
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

export const deleteSectionContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const content = await SectionContent.findByPk(String(req.params.id));
    if (!content) {
      res.status(404).json({ message: "Enlace no encontrado" });
      return;
    }
    await content.destroy();
    res.json({ message: "Enlace eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
