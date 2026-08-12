import { DepartmentModel } from './DepartmentModel.js';
import { Department, ZoneName } from '../types.js';

export class DepartmentCatalog {
  private byRefMap: Map<string, DepartmentModel>;
  private deptsList: DepartmentModel[];

  constructor(departments: (Department | DepartmentModel)[] = []) {
    this.deptsList = departments.map((d) =>
      d instanceof DepartmentModel ? d : new DepartmentModel(d)
    );
    this.byRefMap = new Map();
    this.deptsList.forEach((dept) => {
      if (dept.ref) {
        this.byRefMap.set(dept.ref.toLowerCase(), dept);
      }
    });
  }

  /**
   * Fast O(1) lookup by department reference code.
   */
  getByRef(ref: string): DepartmentModel | undefined {
    if (!ref) return undefined;
    return this.byRefMap.get(ref.toLowerCase().trim());
  }

  /**
   * Retrieves zone contacts for a specific department ref and zone in O(1) time.
   */
  getContacts(ref: string, zone?: ZoneName | string): {
    spocName: string;
    spocMail: string;
    hodMail: string;
    hodName: string;
  } {
    const dept = this.getByRef(ref);
    if (dept) {
      return dept.getContactsForZone(zone);
    }
    return { spocName: '', spocMail: '', hodMail: '', hodName: '' };
  }

  /**
   * Filter departments using search query.
   */
  search(query: string): DepartmentModel[] {
    if (!query) return this.deptsList;
    return this.deptsList.filter((d) => d.matches(query));
  }

  /**
   * Returns dropdown select options [{ label, value }].
   */
  getSelectOptions(): { label: string; value: string; deptName: string; fn: string }[] {
    return this.deptsList.map((d) => ({
      label: `${d.ref} — ${d.dept} (${d.fn})`,
      value: d.ref,
      deptName: d.dept,
      fn: d.fn,
    }));
  }

  /**
   * Returns all departments as array of DepartmentModel.
   */
  getAll(): DepartmentModel[] {
    return this.deptsList;
  }

  /**
   * Returns raw array suitable for API / JSON.
   */
  toRawList(): Department[] {
    return this.deptsList.map((d) => d.toJSON());
  }
}
