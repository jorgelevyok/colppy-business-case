/** Row action menu (edit, detail, custom callbacks) for table rows. */
import { useState } from 'react';
import {
    AddCircle,
    AddPeople,
    ChevronSimple,
    CircleCheck,
    Copy,
    DotsVertical,
    Edit,
    Eye,
    Money,
    Trash,
} from '../../../../../icons';
import { Box } from '../../../Box';
import styles from '../Table.module.css';
import { ModalButton } from './ModalButton';

export const getActionIcon = (row, action) => {
    if (action.icon) {
        if (typeof action.icon === 'function') {
            return action.icon(row);
        }

        return action.icon;
    }

    const defaultColor = action.color || 'var(--color-text)';

    const iconMap = {
        add: <AddCircle color={defaultColor} />,
        add_people: <AddPeople isActive={row[action.active] ?? true} color={defaultColor} />,
        money: <Money isActive={row[action.active] ?? true} color={defaultColor} />,
        delete: (
            <div
                style={{
                    color: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Trash width={20} height={20} />
            </div>
        ),
        switch: (
            <div className={styles['table-actions-switch']}>
                <div
                    className={
                        (row[action.active] ?? true)
                            ? `${styles['table-actions-switch-track']} ${styles['table-actions-switch-track--on']}`
                            : `${styles['table-actions-switch-track']} ${styles['table-actions-switch-track--off']}`
                    }
                >
                    <div className={styles['table-actions-switch-thumb']} />
                </div>
            </div>
        ),
        edit: <Edit color={defaultColor} width={20} height={20} />,
        detail: (
            <div
                style={{
                    color: defaultColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Eye width={20} height={20} />
            </div>
        ),
        copy: <Copy color={defaultColor} width={20} height={20} />,
        chevron: <ChevronSimple color={defaultColor} width={20} height={20} />,
        circle_check: <CircleCheck color={defaultColor} width={20} height={20} />,
        submenu: (
            <div
                style={{
                    color: defaultColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <DotsVertical width={20} height={20} />
            </div>
        ),
    };

    if (iconMap[action.type]) {
        return iconMap[action.type];
    }

    return null;
};

export const ActionButtons = ({ inResponsive, actions, row, rowIndex, setModalOpen, testId }) => {
    const [modalMobileOpen, setModalMobileOpen] = useState(false);

    if (!actions?.length) return null;

    const visibleActions = actions.filter((action) => {
        if (action?.show_condition && !action.show_condition(row, rowIndex)) return false;
        return true;
    });

    if (inResponsive) {
        return (
            <>
                <Box
                    onClick={() => {
                        setModalOpen(rowIndex);
                        setModalMobileOpen(true);
                    }}
                    testId={`${testId}-mobile-open-${rowIndex}`}
                >
                    <DotsVertical />
                </Box>
                <ModalButton
                    isOpen={modalMobileOpen}
                    setIsOpen={(state) => {
                        setModalMobileOpen(state);
                        setModalOpen(state);
                    }}
                >
                    <Box className="flex flex-col gap-6 p-10">
                        {visibleActions.map((action, index) => {
                            const isDisabled = action?.disabled?.(row, rowIndex);
                            const runAction = () => {
                                if (isDisabled || !action.callback) return;
                                setModalMobileOpen(false);
                                setModalOpen(false);
                                action.callback(row, rowIndex);
                            };
                            return (
                                <div
                                    key={index}
                                    onClick={runAction}
                                    className="flex gap-2 cursor-pointer items-center"
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && runAction()}
                                    testId={`${testId}-${action.type}-${rowIndex}`}
                                >
                                    <Box className="w-8 flex items-center justify-center">
                                        {getActionIcon(row, action)}
                                    </Box>
                                    <span>{action.title}</span>
                                </div>
                            );
                        })}
                    </Box>
                </ModalButton>
            </>
        );
    }

    return (
        <>
            {visibleActions.map((action, index) => {
                const isDisabled = action?.disabled?.(row, rowIndex);
                return (
                    <div key={index} className={styles['action-button-wrapper']}>
                        <div
                            onClick={() => {
                                if (!isDisabled && action.callback) action.callback(row, rowIndex);
                            }}
                            onKeyDown={(e) =>
                                e.key === 'Enter' &&
                                !isDisabled &&
                                action.callback &&
                                action.callback(row, rowIndex)
                            }
                            role="button"
                            tabIndex={0}
                            aria-label={action.title}
                            testId={`${testId}-${action.type}-${rowIndex}`}
                        >
                            {getActionIcon(row, action) ?? <span>{action.title}</span>}
                        </div>
                    </div>
                );
            })}
        </>
    );
};
