import { Department, ZoneName } from '../types.js';
import { DepartmentModel } from '../models/DepartmentModel.js';
import { DepartmentCatalog } from '../models/DepartmentCatalog.js';

export const INITIAL_DEPTS: DepartmentModel[] = DepartmentModel.fromList([
  { 
    ref: 'A', 
    dept: 'ADMIN', 
    fn: 'ADMIN', 
    sn: 'Ramesh', 
    sm: 'ramesh.admin@casagrand.co.in', 
    hm: 'suresh.head@casagrand.co.in',
    hodName: 'Suresh Kumar',
    zoneContacts: {
      Chennai: { sn: 'Ramesh (CHN)', sm: 'ramesh.admin.chn@casagrand.co.in', hm: 'suresh.head@casagrand.co.in', hodName: 'Suresh Kumar' },
      Coimbatore: { sn: 'Prabhu (CBE)', sm: 'prabhu.cbe@casagrand.co.in', hm: 'suresh.head@casagrand.co.in', hodName: 'Suresh Kumar' },
      Bangalore: { sn: 'Siddharth (BLR)', sm: 'siddharth.blr@casagrand.co.in', hm: 'suresh.head@casagrand.co.in', hodName: 'Suresh Kumar' }
    }
  },
  { 
    ref: 'AA', 
    dept: 'MIS', 
    fn: 'MIS', 
    sn: 'Jayalalitha', 
    sm: 'jayalalitha@casagrand.co.in', 
    hm: 'yuvaraj@casagrand.co.in',
    hodName: 'Yuvaraj',
    zoneContacts: {
      Chennai: { sn: 'Jayalalitha (CHN)', sm: 'jayalalitha@casagrand.co.in', hm: 'yuvaraj@casagrand.co.in', hodName: 'Yuvaraj' },
      Coimbatore: { sn: 'Murugan (CBE)', sm: 'murugan.cbe@casagrand.co.in', hm: 'yuvaraj@casagrand.co.in', hodName: 'Yuvaraj' },
      Bangalore: { sn: 'Kavitha (BLR)', sm: 'kavitha.blr@casagrand.co.in', hm: 'yuvaraj@casagrand.co.in', hodName: 'Yuvaraj' }
    }
  },
  { 
    ref: 'AB', 
    dept: 'OPERATIONS', 
    fn: 'OPERATIONS POST LAUNCH', 
    sn: 'Balaji', 
    sm: 'balaji.ops@casagrand.co.in', 
    hm: 'sivakumar@casagrand.co.in', 
    hodName: 'Sivakumar',
    zoneContacts: {
      Chennai: { sn: 'Balaji (CHN)', sm: 'balaji.ops.chn@casagrand.co.in', hm: 'sivakumar@casagrand.co.in', hodName: 'Sivakumar' },
      Coimbatore: { sn: 'Sathish (CBE)', sm: 'sathish.ops.cbe@casagrand.co.in', hm: 'sivakumar@casagrand.co.in', hodName: 'Sivakumar' },
      Bangalore: { sn: 'Karthik (BLR)', sm: 'karthik.ops.blr@casagrand.co.in', hm: 'sivakumar@casagrand.co.in', hodName: 'Sivakumar' }
    }
  },
  { 
    ref: 'E1', 
    dept: 'CUSTOMER DELIGHT', 
    fn: 'CUSTOMER DELIGHT - I CARE', 
    sn: 'Janani', 
    sm: 'janani.icare@casagrand.co.in', 
    hm: 'anszary@casagrand.co.in', 
    hodName: 'Anszary',
    zoneContacts: {
      Chennai: { sn: 'Janani (CHN)', sm: 'janani.icare.chn@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
      Coimbatore: { sn: 'Varunya (CBE)', sm: 'varunya.icare.cbe@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
      Bangalore: { sn: 'Shalini (BLR)', sm: 'shalini.icare.blr@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' }
    }
  },
  { 
    ref: 'E2', 
    dept: 'CUSTOMER DELIGHT', 
    fn: 'CUSTOMER DELIGHT - I CARE - REFUND', 
    sn: 'Fathima', 
    sm: 'syedali@casagrand.co.in', 
    hm: 'anszary@casagrand.co.in', 
    hodName: 'Anszary',
    zoneContacts: {
      Chennai: { sn: 'Fathima (CHN)', sm: 'syedali@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
      Coimbatore: { sn: 'Syed (CBE)', sm: 'syed.cbe@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
      Bangalore: { sn: 'Aravind (BLR)', sm: 'aravind.blr@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' }
    }
  },
  { 
    ref: 'F', 
    dept: 'ENGINEERING COMMERCIAL', 
    fn: 'ENGINEERING COMMERCIAL - DESIGN', 
    sn: 'Vidhya', 
    sm: 'vidhya.v@casagrand.co.in', 
    hm: 'velumani@casagrand.co.in', 
    hodName: 'Velumani',
    zoneContacts: {
      Chennai: { sn: 'Vidhya (CHN)', sm: 'vidhya.v@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' },
      Coimbatore: { sn: 'Raj (CBE)', sm: 'raj.design.cbe@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' },
      Bangalore: { sn: 'Shankar (BLR)', sm: 'shankar.design.blr@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' }
    }
  },
  { 
    ref: 'F1', 
    dept: 'ENGINEERING COMMERCIAL', 
    fn: 'ENGINEERING COMMERCIAL - CONTRACTS', 
    sn: 'Vemulu', 
    sm: 'vemulu@casagrand.co.in', 
    hm: 'jayaprabu@casagrand.co.in', 
    hodName: 'Jayaprabu',
    zoneContacts: {
      Chennai: { sn: 'Vemulu (CHN)', sm: 'vemulu@casagrand.co.in', hm: 'jayaprabu@casagrand.co.in', hodName: 'Jayaprabu' },
      Coimbatore: { sn: 'Manimaran (CBE)', sm: 'manimaran.cbe@casagrand.co.in', hm: 'jayaprabu@casagrand.co.in', hodName: 'Jayaprabu' },
      Bangalore: { sn: 'Kumar (BLR)', sm: 'kumar.blr@casagrand.co.in', hm: 'jayaprabu@casagrand.co.in', hodName: 'Jayaprabu' }
    }
  },
  { 
    ref: 'F2', 
    dept: 'ENGINEERING COMMERCIAL', 
    fn: 'ENGINEERING COMMERCIAL - BILLING', 
    sn: 'Manimaran', 
    sm: 'manimaran@casagrand.co.in', 
    hm: 'velumani@casagrand.co.in', 
    hodName: 'Velumani',
    zoneContacts: {
      Chennai: { sn: 'Manimaran (CHN)', sm: 'manimaran@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' },
      Coimbatore: { sn: 'Suresh (CBE)', sm: 'suresh.billing.cbe@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' },
      Bangalore: { sn: 'Ramesh (BLR)', sm: 'ramesh.billing.blr@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' }
    }
  },
  { 
    ref: 'R1', 
    dept: 'HUMAN RESOURCES', 
    fn: 'HR - RECRUITMENT', 
    sn: 'Vignesh', 
    sm: 'vignesh.kumar@casagrand.co.in', 
    hm: 'naveenkumar.v@casagrand.co.in', 
    hodName: 'Naveen Kumar V',
    zoneContacts: {
      Chennai: { sn: 'Vignesh (CHN)', sm: 'vignesh.kumar@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' },
      Coimbatore: { sn: 'Akshatha (CBE)', sm: 'akshatha.cbe@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' },
      Bangalore: { sn: 'Priya (BLR)', sm: 'priya.blr@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' }
    }
  },
  { 
    ref: 'R3', 
    dept: 'HUMAN RESOURCES', 
    fn: 'HR - PAYROLL', 
    sn: 'Akshatha', 
    sm: 'akshathakumar@casagrand.co.in', 
    hm: 'naveenkumar.v@casagrand.co.in', 
    hodName: 'Naveen Kumar V',
    zoneContacts: {
      Chennai: { sn: 'Akshatha (CHN)', sm: 'akshathakumar@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' },
      Coimbatore: { sn: 'Divya (CBE)', sm: 'divya.payroll.cbe@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' },
      Bangalore: { sn: 'Swathi (BLR)', sm: 'swathi.payroll.blr@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' }
    }
  }
]);

/**
 * Helper to dynamically derive SPOC and HOD contact details for a department based on Zone using DepartmentCatalog
 */
export function getZoneDeptContacts(
  ref: string, 
  zone?: ZoneName | string, 
  deptsList: Department[] = INITIAL_DEPTS
): { spocName: string; spocMail: string; hodMail: string; hodName: string } {
  const catalog = new DepartmentCatalog(deptsList);
  return catalog.getContacts(ref, zone);
}
