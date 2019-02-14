import { initialState, reducer } from './board.reducer';
import { AnswerRating } from '../data-model';
import { PostAnswerAction } from '../actions';

describe('QuestionBank Board Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });
  });

  describe('PostAnswer action', () => {
    it('should add answer to the store', () => {
      const firstPayload: AnswerRating = { categoryId: 'java-core', questionId: '1234', rating: 0 };
      const firstResult = reducer(initialState, new PostAnswerAction(firstPayload));
      const secondPayload: AnswerRating = { categoryId: 'java-core', questionId: '5678', rating: 2 };
      const secondResult = reducer(firstResult, new PostAnswerAction(secondPayload));
      expect(Object.keys(firstResult.answers).includes('1234')).toBeTruthy();
      expect(firstResult.answers['1234']).toEqual(firstPayload);
      expect(Object.keys(secondResult.answers).includes('1234')).toBeTruthy();
      expect(Object.keys(secondResult.answers).includes('5678')).toBeTruthy();
    });
  });
});
