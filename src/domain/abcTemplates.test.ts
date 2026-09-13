import { ABC_TEMPLATES, getTemplateForChallengeDay } from './abcTemplates';

describe('ABC workout templates', () => {
  it('repeats A, B and C continuously without rest days', () => {
    expect(getTemplateForChallengeDay(1)).toBe(ABC_TEMPLATES.A);
    expect(getTemplateForChallengeDay(2)).toBe(ABC_TEMPLATES.B);
    expect(getTemplateForChallengeDay(3)).toBe(ABC_TEMPLATES.C);
    expect(getTemplateForChallengeDay(4)).toBe(ABC_TEMPLATES.A);
  });

  it('preserves the supplied incline bench prescription', () => {
    expect(ABC_TEMPLATES.A[0]).toMatchObject({
      name: 'Supino inclinado com barra',
      sets: '2×10, 2×8',
      imageKey: 'barbell-incline-bench',
    });
  });
});
