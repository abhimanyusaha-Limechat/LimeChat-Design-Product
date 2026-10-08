import type { BotTemplateRow } from '../components/BotTemplatesTable';

const contact = (id: string, name: string, email: string, phone: string, tickets: number, instagram?: string): BotTemplateRow => ({
  id,
  name,
  description: email,
  phone,
  tickets,
  instagram,
  type: 'task',
  usecases: [],
  industries: [],
  scope: 'account',
});

export const CONTACT_TAGS = ['VIP', 'Repeat buyer', 'Wholesale', 'Refund requested', 'New customer'];

// Demo: spread a tag or two across contacts so the Tags filter has something to match.
const tagsFor = (i: number) => [CONTACT_TAGS[i % 5], ...(i % 3 === 0 ? [CONTACT_TAGS[(i + 2) % 5]] : [])];

const CONTACTS: BotTemplateRow[] = [
  contact('ct1', 'Priya Sharma', 'priya.sharma@gmail.com', '+91-98201 44312', 4, 'priya.styles'),
  contact('ct2', 'Rahul Verma', 'rahul.v@outlook.com', '+91-99877 21056', 1),
  contact('ct3', 'Neha Gupta', 'neha.gupta@yahoo.in', '+91-90040 78213', 7, 'nehagupta_'),
  contact('ct4', 'Arjun Reddy', 'arjun.reddy@gmail.com', '+91-81234 55620', 0),
  contact('ct5', 'Sana Khan', 'sana.khan@gmail.com', '+91-97690 33481', 2, 'sanakhan.art'),
  contact('ct6', 'Vivek Joshi', 'vivek.joshi@proton.me', '+91-88501 64729', 12, 'vivek.travels'),
  contact('ct7', 'Kavya Menon', 'kavya.menon@gmail.com', '+91-94470 18856', 3, 'kavya.bakes'),
  contact('ct8', 'Aditya Kulkarni', 'aditya.k@gmail.com', '+91-70214 90377', 1),
  contact('ct9', 'Pooja Bansal', 'pooja.bansal@hotmail.com', '+91-98112 67045', 5, 'pooja.bansal'),
  contact('ct10', 'Imran Shaikh', 'imran.shaikh@gmail.com', '+91-90290 42318', 0),
  contact('ct11', 'Divya Nair', 'divya.nair@gmail.com', '+91-96330 85142', 9, 'divya.nair'),
  contact('ct12', 'Harsh Agarwal', 'harsh.agarwal@gmail.com', '+91-99300 17264', 2),
];

export const DEMO_CONTACTS: BotTemplateRow[] = CONTACTS.map((c, i) => ({ ...c, tags: tagsFor(i) }));
