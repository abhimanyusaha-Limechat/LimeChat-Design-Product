export interface PickerAccount {
  id: string;
  name: string;
  role: string;
}

/** Demo accounts the signed-in email belongs to (stand-in for a backend lookup). */
export const pickerAccounts: PickerAccount[] = [
  { id: '29490', name: 'Anoushka Test', role: 'Administrator' },
  { id: '29011', name: '30 Sundays', role: 'Administrator' },
  { id: '28923', name: 'Kenaz', role: 'Administrator' },
  { id: '29512', name: 'A4 Hospital', role: 'Administrator' },
  { id: '29518', name: 'ClearTax', role: 'Administrator' },
  { id: '29491', name: 'Innovative Solutions', role: 'Administrator' },
  { id: '29492', name: 'Galaxycolors India Private Limited', role: 'Administrator' },
  { id: '29493', name: 'Goyaz Jewellery', role: 'Administrator' },
  { id: '29494', name: 'Salasar Enterprises', role: 'Administrator' },
];
