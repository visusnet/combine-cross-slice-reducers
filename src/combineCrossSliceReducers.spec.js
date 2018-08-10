// @flow
import {combineCrossSliceReducers} from './combineCrossSliceReducers';

describe('combineCrossSliceReducers should', () => {
    const initialSliceState = {};
    const initialGlobalState = {a: initialSliceState, b: initialSliceState};
    const action = {type: 'anything'};
    const mockImplementation = state => typeof state === 'undefined' ? initialSliceState : state;
    const mockReducer1 = jest.fn(mockImplementation);
    const mockReducer2 = jest.fn(mockImplementation);

    it('call every reducer', () => {
        const combinedReducer = combineCrossSliceReducers({
            a: mockReducer1,
            b: mockReducer2
        });
        combinedReducer(undefined, action);
        expect(mockReducer1).toHaveBeenCalledWith(undefined, action, initialGlobalState);
        expect(mockReducer2).toHaveBeenCalledWith(undefined, action, initialGlobalState);
    });

    it('pass only the slice as first argument to reducers', () => {
        const combinedReducer = combineCrossSliceReducers({
            a: mockReducer1,
            b: mockReducer2
        });
        const sliceAState = {key: 'a'};
        const sliceBState = {key: 'b'};
        const prevGlobalState = {
            a: sliceAState,
            b: sliceBState
        };
        combinedReducer(prevGlobalState, action);
        expect(mockReducer1).toHaveBeenCalledWith(sliceAState, action, prevGlobalState);
        expect(mockReducer2).toHaveBeenCalledWith(sliceBState, action, prevGlobalState);
    });

    it('pass modified global state to succeeding reducers', () => {
        const sliceAState = {modified: true};
        const combinedReducer = combineCrossSliceReducers({
            a: () => sliceAState,
            b: mockReducer2
        });
        const intermediateGlobalState = {
            a: sliceAState,
            b: initialSliceState
        };
        combinedReducer(initialGlobalState, action);
        expect(mockReducer2).toHaveBeenCalledWith(initialSliceState, action, intermediateGlobalState);
    });

    it('return updated global state', () => {
        const combinedReducer = combineCrossSliceReducers({
            a: (state = 0) => state + 1,
            b: (state = 0, _, globalState) => state - globalState.a
        });
        const nextGlobalState = combinedReducer(undefined, action);
        expect(nextGlobalState).toEqual({
            a: 1,
            b: -1
        });
    });
});