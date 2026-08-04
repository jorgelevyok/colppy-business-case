/** Filters row actions by permissions/type and wraps switch actions with table refresh. */
import { useMemo } from 'react';

/** After a switch row action, refreshes table data unless skipRefreshAfterSwitchCallback is set. */
export const wrapSwitchActionsWithRefresh = (actions, refresh) => {
    if (!actions?.length || typeof refresh !== 'function') return actions;

    return actions.map((action) => {
        if (action.type !== 'switch' || typeof action.callback !== 'function') {
            return action;
        }
        if (action.skipRefreshAfterSwitchCallback === true) {
            return action;
        }
        const originalCallback = action.callback;
        return {
            ...action,
            callback: async (row, rowIndex) => {
                await Promise.resolve(originalCallback(row, rowIndex));
                await Promise.resolve(refresh());
            },
        };
    });
};

/** Filters actions by show_condition_global / show_condition per row. */
export const useTableActions = (actions) => {
    const filteredActions = useMemo(() => {
        if (!actions || actions.length === 0) return null;

        const validActions = actions.filter((action) => {
            if (action.show_condition_global) {
                try {
                    if (action.show_condition_global() !== true) return false;
                } catch {
                    return false;
                }
            }
            if (!action.show_condition) return true;
            const paramCount = action.show_condition.length;
            if (paramCount === 0) {
                try {
                    return action.show_condition() === true;
                } catch {
                    return false;
                }
            }
            return true;
        });

        return validActions.length > 0 ? validActions : null;
    }, [actions]);

    return filteredActions;
};
