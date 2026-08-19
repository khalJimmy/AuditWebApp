import { Department, ZoneName, ZoneContact } from '../types.js';

export class DepartmentModel implements Department {
  id?: string;
  ref: string;
  dept: string;
  fn: string;
  sn: string;
  sm: string;
  hm: string;
  hodName: string;
  zoneContacts?: Partial<Record<ZoneName, ZoneContact>>;

  constructor(data?: Partial<Department>) {
    this.id = (data?.id || (data?.ref ? `dept_${data.ref.toLowerCase()}` : '')).trim();
    this.ref = (data?.ref || '').trim();
    this.dept = (data?.dept || '').trim();
    this.fn = (data?.fn || '').trim();
    this.sn = (data?.sn || '').trim();
    this.sm = (data?.sm || '').trim();
    this.hm = (data?.hm || '').trim();
    this.hodName = (data?.hodName || '').trim();
    this.zoneContacts = data?.zoneContacts ? { ...data.zoneContacts } : {};
  }

  /**
   * Resolves contact details (SPOC Name, SPOC Email, HOD Email, HOD Name) for a given zone.
   * Falls back to default department contacts if specific zone contact is missing.
   */
  getContactsForZone(zone?: ZoneName | string): {
    spocName: string;
    spocMail: string;
    hodMail: string;
    hodName: string;
  } {
    if (zone && this.zoneContacts && this.zoneContacts[zone as ZoneName]) {
      const zContact = this.zoneContacts[zone as ZoneName]!;
      return {
        spocName: zContact.sn || this.sn,
        spocMail: zContact.sm || this.sm,
        hodMail: zContact.hm || this.hm,
        hodName: zContact.hodName || this.hodName,
      };
    }
    return {
      spocName: this.sn,
      spocMail: this.sm,
      hodMail: this.hm,
      hodName: this.hodName,
    };
  }

  /**
   * Checks if department fields match a given search query string.
   */
  matches(query: string): boolean {
    if (!query) return true;
    const q = query.toLowerCase().trim();
    return (
      this.ref.toLowerCase().includes(q) ||
      this.dept.toLowerCase().includes(q) ||
      this.fn.toLowerCase().includes(q) ||
      this.sn.toLowerCase().includes(q) ||
      this.sm.toLowerCase().includes(q) ||
      this.hodName.toLowerCase().includes(q) ||
      this.hm.toLowerCase().includes(q)
    );
  }

  /**
   * Validates required department fields.
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.ref) errors.push('Department Reference Code (ref) is required.');
    if (!this.dept) errors.push('Department Name is required.');
    if (!this.fn) errors.push('Function Name is required.');
    if (!this.sm) errors.push('SPOC Email is required.');
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Converts the instance to a clean plain JS object suitable for JSON serialization / API payloads.
   */
  toJSON(): Department {
    return {
      id: this.id,
      ref: this.ref,
      dept: this.dept,
      fn: this.fn,
      sn: this.sn,
      sm: this.sm,
      hm: this.hm,
      hodName: this.hodName,
      ...(Object.keys(this.zoneContacts || {}).length > 0 ? { zoneContacts: this.zoneContacts } : {}),
    };
  }

  /**
   * Static Factory: Creates a DepartmentModel from JSON/raw object.
   */
  static fromJSON(data: any): DepartmentModel {
    return new DepartmentModel(data);
  }

  /**
   * Static Factory: Converts an array of department raw objects to DepartmentModel array.
   */
  static fromList(list: any[]): DepartmentModel[] {
    if (!Array.isArray(list)) return [];
    return list.map((item) => DepartmentModel.fromJSON(item));
  }
}
