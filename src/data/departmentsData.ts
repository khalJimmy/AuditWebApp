import { Department, ZoneName, ZoneContact } from '../types';

export const INITIAL_DEPTS: Department[] = [
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
      Chennai: { sn: 'Jayalalitha', sm: 'jayalalitha@casagrand.co.in', hm: 'yuvaraj@casagrand.co.in', hodName: 'Yuvaraj' },
      Coimbatore: { sn: 'Murugan (CBE)', sm: 'murugan.cbe@casagrand.co.in', hm: 'yuvaraj@casagrand.co.in', hodName: 'Yuvaraj' },
      Bangalore: { sn: 'Kavitha (BLR)', sm: 'kavitha.blr@casagrand.co.in', hm: 'yuvaraj@casagrand.co.in', hodName: 'Yuvaraj' }
    }
  },
  { ref: 'AB', dept: 'OPERATIONS', fn: 'OPERATIONS POST LAUNCH', sn: 'Balaji', sm: 'balaji.ops@casagrand.co.in', hm: 'sivakumar@casagrand.co.in', hodName: 'Sivakumar' },
  { ref: 'AB1', dept: 'OPERATIONS', fn: 'OPERATIONS PRE LAUNCH', sn: 'Sathish', sm: 'sathish.ops@casagrand.co.in', hm: 'sivakumar@casagrand.co.in', hodName: 'Sivakumar' },
  { ref: 'AB2', dept: 'OPERATIONS', fn: 'OPERATION PRELAUNCH - RERA', sn: 'Gokul', sm: 'gokul.rera@casagrand.co.in', hm: 'sivakumar@casagrand.co.in', hodName: 'Sivakumar' },
  { ref: 'AB3', dept: 'OPERATIONS', fn: 'OPERATION PRELAUNCH - EB', sn: 'Mani', sm: 'mani.eb@casagrand.co.in', hm: 'sivakumar@casagrand.co.in', hodName: 'Sivakumar' },
  { ref: 'AC', dept: 'P&L', fn: 'P&L', sn: 'Karthik', sm: 'karthik.pnl@casagrand.co.in', hm: 'venkat@casagrand.co.in', hodName: 'Venkat' },
  { 
    ref: 'AD', 
    dept: 'PRODUCT DEVELOPMENT', 
    fn: 'PRODUCT DEVELOPMENT - CONCEPT & CLOSURE', 
    sn: 'Deepa', 
    sm: 'deepa.j@casagrand.co.in', 
    hm: 'gautam.agarwaal@casagrand.co.in',
    hodName: 'Gautam Agarwaal',
    zoneContacts: {
      Chennai: { sn: 'Deepa (CHN)', sm: 'deepa.j@casagrand.co.in', hm: 'gautam.agarwaal@casagrand.co.in', hodName: 'Gautam Agarwaal' },
      Coimbatore: { sn: 'Naveen (CBE)', sm: 'naveen.pd.cbe@casagrand.co.in', hm: 'gautam.agarwaal@casagrand.co.in', hodName: 'Gautam Agarwaal' },
      Bangalore: { sn: 'Meera (BLR)', sm: 'meera.pd.blr@casagrand.co.in', hm: 'gautam.agarwaal@casagrand.co.in', hodName: 'Gautam Agarwaal' }
    }
  },
  { ref: 'AD1', dept: 'PRODUCT DEVELOPMENT', fn: 'PRODUCT DEVELOPMENT - SUPERIOR HOMES', sn: 'Shanmugapriya', sm: 'shanmugapriya.r@casagrand.co.in', hm: 'shanmugapriya.r@casagrand.co.in', hodName: 'Shanmugapriya' },
  { ref: 'AD2', dept: 'PRODUCT DEVELOPMENT', fn: 'PRODUCT DEVELOPMENT - PVF', sn: 'Rajesh', sm: 'rajesh.pvf@casagrand.co.in', hm: 'gautam.agarwaal@casagrand.co.in', hodName: 'Gautam Agarwaal' },
  { ref: 'AD3', dept: 'PRODUCT DEVELOPMENT', fn: 'PRODUCT DEVELOPMENT - MODEL HOUSE', sn: 'Subhash', sm: 'subhash.model@casagrand.co.in', hm: 'gautam.agarwaal@casagrand.co.in', hodName: 'Gautam Agarwaal' },
  { ref: 'AD4', dept: 'PRODUCT DEVELOPMENT', fn: 'PRODUCT DEVELOPMENT - OPERATIONS', sn: 'Dinesh', sm: 'dinesh.pd@casagrand.co.in', hm: 'gautam.agarwaal@casagrand.co.in', hodName: 'Gautam Agarwaal' },
  { ref: 'AD5', dept: 'PRODUCT DEVELOPMENT', fn: 'PRODUCT DEVELOPMENT - FINISHING', sn: 'Premanand', sm: 'premanand@casagrand.co.in', hm: 'gautam.agarwaal@casagrand.co.in', hodName: 'Gautam Agarwaal' },
  { 
    ref: 'AE', 
    dept: 'RETENTION', 
    fn: 'RETENTION', 
    sn: 'Seshadri', 
    sm: 'seshadri@casagrand.co.in', 
    hm: 'dinesh.r@casagrand.co.in',
    hodName: 'Dinesh R',
    zoneContacts: {
      Chennai: { sn: 'Seshadri (CHN)', sm: 'seshadri@casagrand.co.in', hm: 'dinesh.r@casagrand.co.in', hodName: 'Dinesh R' },
      Coimbatore: { sn: 'Arun (CBE)', sm: 'arun.ret.cbe@casagrand.co.in', hm: 'dinesh.r@casagrand.co.in', hodName: 'Dinesh R' },
      Bangalore: { sn: 'Pooja (BLR)', sm: 'pooja.ret.blr@casagrand.co.in', hm: 'dinesh.r@casagrand.co.in', hodName: 'Dinesh R' }
    }
  },
  { ref: 'AF', dept: 'SALES', fn: 'SALES', sn: 'Vijay', sm: 'vijay.sales@casagrand.co.in', hm: 'vimal@casagrand.co.in', hodName: 'Vimal' },
  { ref: 'AG', dept: 'SAP', fn: 'SAP FICO', sn: 'Srikanth', sm: 'srikanth.sap@casagrand.co.in', hm: 'sundar@casagrand.co.in', hodName: 'Sundar' },
  { ref: 'AG1', dept: 'SAP', fn: 'SAP MATERIAL MANAGEMENT', sn: 'Ganesh', sm: 'ganesh.mm@casagrand.co.in', hm: 'sundar@casagrand.co.in', hodName: 'Sundar' },
  { ref: 'AG2', dept: 'SAP', fn: 'SAP PROJECT SYSTEM & BUDGET CONTROL', sn: 'Bala', sm: 'bala.ps@casagrand.co.in', hm: 'sundar@casagrand.co.in', hodName: 'Sundar' },
  { ref: 'AG3', dept: 'SAP', fn: 'SAP SALES & DISTRIBUTION', sn: 'Nandita', sm: 'nandita.sd@casagrand.co.in', hm: 'sundar@casagrand.co.in', hodName: 'Sundar' },
  { 
    ref: 'E', 
    dept: 'CUSTOMER DELIGHT', 
    fn: 'CUSTOMER DELIGHT', 
    sn: 'Varunya', 
    sm: 'varunya@casagrand.co.in', 
    hm: 'anszary@casagrand.co.in',
    hodName: 'Anszary',
    zoneContacts: {
      Chennai: { sn: 'Varunya (CHN)', sm: 'varunya@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
      Coimbatore: { sn: 'Shalini (CBE)', sm: 'shalini.cd.cbe@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
      Bangalore: { sn: 'Gautami (BLR)', sm: 'gautami.cd.blr@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' }
    }
  },
  { ref: 'E1', dept: 'CUSTOMER DELIGHT', fn: 'CUSTOMER DELIGHT - I CARE', sn: 'Janani', sm: 'janani.icare@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
  { ref: 'E2', dept: 'CUSTOMER DELIGHT', fn: 'CUSTOMER DELIGHT - I CARE - REFUND', sn: 'Fathima', sm: 'syedali@casagrand.co.in', hm: 'anszary@casagrand.co.in', hodName: 'Anszary' },
  { ref: 'F', dept: 'ENGINEERING COMMERCIAL', fn: 'ENGINEERING COMMERCIAL - DESIGN', sn: 'Vidhya', sm: 'vidhya.v@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' },
  { ref: 'F1', dept: 'ENGINEERING COMMERCIAL', fn: 'ENGINEERING COMMERCIAL - CONTRACTS', sn: 'Vemulu', sm: 'vemulu@casagrand.co.in', hm: 'jayaprabu@casagrand.co.in', hodName: 'Jayaprabu' },
  { ref: 'F2', dept: 'ENGINEERING COMMERCIAL', fn: 'ENGINEERING COMMERCIAL - BILLING', sn: 'Manimaran', sm: 'manimaran@casagrand.co.in', hm: 'velumani@casagrand.co.in', hodName: 'Velumani' },
  { ref: 'R1', dept: 'HUMAN RESOURCES', fn: 'HR - RECRUITMENT', sn: 'Vignesh', sm: 'vignesh.kumar@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' },
  { ref: 'R3', dept: 'HUMAN RESOURCES', fn: 'HR - PAYROLL', sn: 'Akshatha', sm: 'akshathakumar@casagrand.co.in', hm: 'naveenkumar.v@casagrand.co.in', hodName: 'Naveen Kumar V' }
];

/**
 * Helper to dynamically derive SPOC and HOD contact details for a department based on Zone
 */
export function getZoneDeptContacts(
  ref: string, 
  zone?: ZoneName | string, 
  deptsList: Department[] = INITIAL_DEPTS
): { spocName: string; spocMail: string; hodMail: string; hodName: string } {
  const deptObj = deptsList.find(d => d.ref === ref);
  if (!deptObj) {
    return { spocName: '', spocMail: '', hodMail: '', hodName: '' };
  }

  if (zone && deptObj.zoneContacts && deptObj.zoneContacts[zone as ZoneName]) {
    const zc = deptObj.zoneContacts[zone as ZoneName]!;
    return {
      spocName: zc.sn || deptObj.sn || '',
      spocMail: zc.sm || deptObj.sm || '',
      hodMail: zc.hm || deptObj.hm || '',
      hodName: zc.hodName || deptObj.hodName || ''
    };
  }

  return {
    spocName: deptObj.sn || '',
    spocMail: deptObj.sm || '',
    hodMail: deptObj.hm || '',
    hodName: deptObj.hodName || ''
  };
}
