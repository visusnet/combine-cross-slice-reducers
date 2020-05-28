// @flow
import type {Action} from 'redux';

export type CrossSliceReducer<T, U> = (state: T, action: Action, globalState: U) => T;

export type CrossSliceReducersMapObject = {
    [key: string]: CrossSliceReducer<any, any>
};

// This method works exactly like combineReducers but adds slice crossing reducers which have access to the global
// state that has been generated by regular reducers.
// See also: https://redux.js.org/docs/recipes/reducers/BeyondCombineReducers.html
export const combineCrossSliceReducers = (
    ...sliceCrossingReducersList: CrossSliceReducersMapObject[]
) => (state: Object = {}, action: any) => {
    let hasChanged = false;
    const nextState = {};

    for (const sliceCrossingReducers of sliceCrossingReducersList) {
        const sliceCrossingReducerKeys = Object.keys(sliceCrossingReducers);
        for (let i = 0; i < sliceCrossingReducerKeys.length; i++) {
            const key = sliceCrossingReducerKeys[i];
            const reducer = sliceCrossingReducers[key];
            const previousStateForKey = state[key];
            const nextStateForKey = reducer(previousStateForKey, action, nextState);
            if (typeof nextStateForKey === 'undefined') {
                throw new Error(`Reducer ${key} returned undefined.`);
            }
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
    }
    return hasChanged ? nextState : state;
};
