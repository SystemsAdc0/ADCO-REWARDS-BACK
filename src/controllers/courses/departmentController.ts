import { Request, Response } from "express";
import { AuthRequest } from "../../types";
import Department from "../../models/courses/Department";

export const getDepartments = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const departments = await Department.findAll({ order: [["name", "ASC"]] });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const getDepartmentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const department = await Department.findByPk(String(req.params.id));
    if (!department) {
      res.status(404).json({ message: "Departamento no encontrado" });
      return;
    }
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const createDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name } = req.body;
    const department = await Department.create({ name: name.trim() });
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const updateDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const department = await Department.findByPk(String(req.params.id));
    if (!department) {
      res.status(404).json({ message: "Departamento no encontrado" });
      return;
    }
    await department.update(req.body);
    res.json(department);
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};

export const deleteDepartment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const department = await Department.findByPk(String(req.params.id));
    if (!department) {
      res.status(404).json({ message: "Departamento no encontrado" });
      return;
    }
    await department.destroy();
    res.json({ message: "Departamento eliminado" });
  } catch (err) {
    res.status(500).json({ message: "Error", error: err });
  }
};
