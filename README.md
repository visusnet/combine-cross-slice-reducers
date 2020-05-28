combineCrossSliceReducers
===

[![npm version](https://badge.fury.io/js/combine-cross-slice-reducers.svg)](https://badge.fury.io/js/combine-cross-slice-reducers)

Yet another way to scale reducers.

## Install

With npm:
```bash
npm i --save combine-cross-slice-reducers
```
Or with yarn:
```bash
yarn add -D combine-cross-slice-reducers
```

## Usage

The usage of `combineCrossSliceReducers` is the same as [Redux's combineReducers](https://redux.js.org/api/combinereducers/)'s one.

A cross-slice reducer receives a third argument which is the updated global state.

## Example

The following example is based on a real-world implementation that partly inspired this module.

Let's assume we have a form reducers that are responsible for form values and enabled/visible states of form fields:

```javascript
const dataUpdated = (data, user) => ({
    type: 'DATA_UPDATED',
    data,
    user
});

const INITIAL_FORM1_STATE = {
    areFieldsVisible: false,
    areFieldsEnabled: false,
    field1: '',
    field2: true
};

const form1Reducer = (state = INITIAL_FORM1_STATE, action) => {
    if (action.type === 'FORM1_DATA_UPDATED') {
        const canRead = action.user.permissions.includes('READ');
        return {
            areFieldsVisible: canRead,
            areFieldsEnabled: action.user.permissions.includes('WRITE'),
            field1: action.data.key1 || '',
            field2: action.data.key2 && canRead
        };
    }
    return state;
};

const INITIAL_FORM2_STATE = {
    areFieldsVisible: false,
    areFieldsEnabled: false,
    field1: 0,
    field2: [],
    field3: false
};

const form2Reducer = (state = INITIAL_FORM2_STATE, action) => {
    if (action.type === 'FORM2_DATA_UPDATED') {
        const canRead = action.user.permissions.includes('READ');
        const canWrite = action.user.permissions.includes('WRITE');
        return {
            areFieldsVisible: canRead,
            areFieldsEnabled: canWrite,
            field1: parseInt(action.data.key1, 10),
            field2: Array.isArray(action.data.key2) ? action.data.key2 : [action.data.key2],
            field3: canRead && !canWrite
        };
    }
    return state;
};
```

These are very basic reducers but we know that reality is more complicated than that. You usually do some kind of conversion between the data that you have received, e.g. from a backend, and what you want to display to the user. These reducers already have some duplicate logic. This can get messy very quickly.

The idea behind cross-slice reducers is to separate reducers based on their concerns. With cross-slice reducers we can write the above reducers as follows:

```javascript
const INITIAL_PERMISSION_STATE = {
    canRead: false,
    canWrite: false
};

const permissionReducer = (state = INITIAL_STATE, action) => {
    if (action.type === 'FORM1_DATA_UPDATED' || action.type === 'FORM2_DATA_UPDATED') {
        return {
            canRead: action.user.permissions.includes('READ'),
            canWrite: action.user.permissions.includes('WRITE')
        };
    }
    return state;
};

const INITIAL_FORM1_STATE = {
    field1: '',
    field2: true
};

const form1Reducer = (state = INITIAL_FORM1_STATE, action, globalState) => {
    if (action.type === 'FORM1_DATA_UPDATED') {
        return convertDataForForm1(action.data, globalState.permission.canRead);
    }
    return state;
};

const INITIAL_FORM2_STATE = {
    field1: 0,
    field2: [],
    field3: false
};

const form2Reducer = (state = INITIAL_FORM2_STATE, action, globalState) => {
    if (action.type === 'FORM2_DATA_UPDATED') {
        return convertDataForForm2(action.data, globalState.permission.canRead, globalState.permission.canWrite);
    }
    return state;
};

function convertDataForForm1(data, canRead) {
    return {
        field1: action.data.key1 || '',
        field2: action.data.key2 && canRead
    };
}

function convertDataForForm2(data, canRead, canWrite) {
    return {
            field1: parseInt(action.data.key1, 10),
            field2: Array.isArray(action.data.key2) ? action.data.key2 : [action.data.key2],
            field3: canRead && !canWrite
    };
}
```
While this seems to be much more boilerplate, it is still cleaner code because
- duplication of knowledge has been reduces,
- the single responsibility principle is not violated, and
- it enables easier refactoring into much smaller reducers.

To complete this example, we define our root reducer:
```javascript
import combineCrossSliceReducers from 'combine-cross-slice-reducers';

const sharedReducers = {
    permission: permissionReducer
};

const formReducers = {
    form1: form1Reducer,
    form2: form2Reducer        
};

const rootReducer = combineCrossSliceReducers(sharedReducers, formReducers);
```

## You might not need this

If ``combineReducers`` does not work for you, you might want to consider other libraries as well which might fit your needs better than this library does, e.g.:

- [combine-section-reducers](https://gitlab.com/ryo33/combine-section-reducers/) - Very similar to this library but without stages between reducers, i.e. the global state is not modified
- [reduce-reducers](https://github.com/redux-utilities/reduce-reducers) - Reduce multiple reducers into a single reducer from left to right
- [reducer-pipe](https://github.com/bydooweedoo/reducer-pipe) - Allows to pipe redux reducers with given state and action, passing previously returned state to next reducer, then keep last updated state
- You can find [many more](https://github.com/markerikson/redux-ecosystem-links/blob/master/reducers.md) in [Mark Erikson](https://github.com/markerikson)'s curated list

## Contributors

- [Pawel Badenski](https://github.com/pbadenski)

## License

MIT
