import { describe, expect, it } from 'vitest';
import { applyFormat } from './textFormat';

const bold = (v: string, s: number, e = s) => applyFormat(v, s, e, 'bold', 'whatsapp');

describe('applyFormat toggle', () => {
  it('wraps a selection and keeps it on the inner text', () => {
    expect(bold('hi there', 3, 8)).toEqual({ value: 'hi *there*', selectionStart: 4, selectionEnd: 9 });
  });
  it('unwraps when the markers sit outside the selection', () => {
    expect(bold('hi *there*', 4, 9)).toEqual({ value: 'hi there', selectionStart: 3, selectionEnd: 8 });
  });
  it('unwraps when the selection includes the markers', () => {
    expect(bold('hi *there*', 3, 10)).toEqual({ value: 'hi there', selectionStart: 3, selectionEnd: 8 });
  });
  it('inserts an empty pair with the caret between', () => {
    expect(bold('hi ', 3)).toEqual({ value: 'hi **', selectionStart: 4, selectionEnd: 4 });
  });
  it('removes an empty pair', () => {
    expect(bold('hi **', 4)).toEqual({ value: 'hi ', selectionStart: 3, selectionEnd: 3 });
  });
  it('unwraps the span around the caret', () => {
    expect(bold('*hello* x', 3)).toEqual({ value: 'hello x', selectionStart: 2, selectionEnd: 2 });
  });
  it('wraps a caret outside any span', () => {
    expect(bold('*a* b', 5).value).toBe('*a* b**');
  });
  it('repeated clicks on a selection return to the original', () => {
    let r = { value: 'hello', selectionStart: 0, selectionEnd: 5 };
    for (let i = 0; i < 4; i++) {
      r = bold(r.value, r.selectionStart, r.selectionEnd);
      expect(r.value).toBe(i % 2 === 0 ? '*hello*' : 'hello');
    }
  });
  it('repeated clicks with a caret never build up markers', () => {
    let r = { value: 'ab ', selectionStart: 3, selectionEnd: 3 };
    for (let i = 0; i < 6; i++) {
      r = applyFormat(r.value, r.selectionStart, r.selectionEnd, i % 2 ? 'bold' : 'italic', 'whatsapp');
      r = applyFormat(r.value, r.selectionStart, r.selectionEnd, i % 2 ? 'bold' : 'italic', 'whatsapp');
      expect(r.value).toBe('ab ');
    }
    expect(r.value).not.toMatch(/\*\*|__/);
  });
  it('leaves other markers alone', () => {
    const it = applyFormat('_hello_', 1, 6, 'italic', 'whatsapp');
    expect(it.value).toBe('hello');
    const b = bold('_hello_', 1, 6);
    expect(b).toEqual({ value: '_*hello*_', selectionStart: 2, selectionEnd: 7 });
    expect(applyFormat(b.value, 1, 8, 'italic', 'whatsapp').value).toBe('*hello*');
  });
});
