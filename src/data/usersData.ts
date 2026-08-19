import { User } from '../types.js';

export function h6(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

export const INITIAL_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Jim Elliot (Audit Lead & Admin)', 
    username: 'admin', 
    email: 'jimelliot.sf@casagrand.co.in',
    pw: h6('Audit@2026'), 
    role: 'admin', 
    zone: '', 
    depts: [] 
  },
  { 
    id: 'u1_direct', 
    name: 'Jim Elliot (Casagrand)', 
    username: 'jimelliot.sf@casagrand.co.in', 
    email: 'jimelliot.sf@casagrand.co.in',
    pw: h6('Audit@2026'), 
    role: 'admin', 
    zone: '', 
    depts: [] 
  },
  { 
    id: 'u2', 
    name: 'Jake (Chennai Auditor)', 
    username: 'auditor1', 
    pw: h6('Audit@2026'), 
    role: 'auditor', 
    zone: 'Chennai', 
    depts: ['AA', 'AE', 'AD', 'E', 'F'] 
  },
  { 
    id: 'u3', 
    name: 'Anand (Coimbatore Auditor)', 
    username: 'auditor2', 
    pw: h6('Audit@2026'), 
    role: 'auditor', 
    zone: 'Coimbatore', 
    depts: ['AA', 'R1', 'F1', 'E2'] 
  },
  { 
    id: 'u4', 
    name: 'Deepak (Bangalore Auditor)', 
    username: 'auditor3', 
    pw: h6('Audit@2026'), 
    role: 'auditor', 
    zone: 'Bangalore', 
    depts: ['AA', 'AC', 'AE', 'F2'] 
  },
  { 
    id: 'u5', 
    name: 'Jayalalitha (MIS SPOC - Chennai)', 
    username: 'spoc.mis', 
    pw: h6('Spoc@2026'), 
    role: 'spoc', 
    zone: 'Chennai', 
    depts: ['AA'] 
  },
  { 
    id: 'u6', 
    name: 'Seshadri (Retention SPOC - Chennai)', 
    username: 'spoc.ae', 
    pw: h6('Spoc@2026'), 
    role: 'spoc', 
    zone: 'Chennai', 
    depts: ['AE'] 
  },
  { 
    id: 'u7', 
    name: 'Varunya (Cust Delight SPOC)', 
    username: 'spoc.e', 
    pw: h6('Spoc@2026'), 
    role: 'spoc', 
    zone: 'Chennai', 
    depts: ['E', 'E1', 'E2', 'E3', 'E4', 'E5'] 
  },
  { 
    id: 'u8', 
    name: 'Kavitha (MIS SPOC - Bangalore)', 
    username: 'spoc.mis.blr', 
    pw: h6('Spoc@2026'), 
    role: 'spoc', 
    zone: 'Bangalore', 
    depts: ['AA'] 
  },
  { 
    id: 'u9', 
    name: 'Murugan (MIS SPOC - Coimbatore)', 
    username: 'spoc.mis.cbe', 
    pw: h6('Spoc@2026'), 
    role: 'spoc', 
    zone: 'Coimbatore', 
    depts: ['AA'] 
  }
];
