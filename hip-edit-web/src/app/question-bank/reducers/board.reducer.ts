import { QuestionBankActionTypes, QuestionBankActions} from '../actions';
import * as _ from 'lodash';

export type QuestionBoard = {
  selectedCategoryId?: string;
  selectedQuestionId?: string;
};

export const initialState: QuestionBoard = {};

export function reducer(state = initialState, action: QuestionBankActions): QuestionBoard {
  switch (action.type) {
    case QuestionBankActionTypes.SelectCategory: {
      return { ...state, selectedCategoryId: action.payload }
    }
    case QuestionBankActionTypes.FirstCategory: {
      if (!state.selectedCategoryId) {
        return { ...state, selectedCategoryId: action.payload }
      } else {
        return state;
      }
    }
    case QuestionBankActionTypes.SelectQuestion: {
      return { ...state, selectedQuestionId: action.payload }
    }
    case QuestionBankActionTypes.FirstQuestion: {
      if (!state.selectedQuestionId || state.selectedQuestionId !== action.payload) {
        return { ...state, selectedQuestionId: action.payload }
      } else {
        return state;
      }
    }
    case QuestionBankActionTypes.NoQuestion: {
      return _.omit(state, ['selectedQuestionId']);
    }
    default:
      return state;
  }
}
