/** Row selection checkbox for bulk actions (when enabled in config). */
import sx from '../Table.module.css';

export const CellCheckbox = ({
    row,
    checkedList,
    keyToCheckSelected,
    onSelectRow = () => {},
    testId,
}) => {
    const isChecked = (r) =>
        checkedList?.some((some_row) => some_row[keyToCheckSelected] === r[keyToCheckSelected]);

    return (
        <td>
            <label className="flex justify-center items-center w-full h-full gap-3 cursor-pointer">
                <input
                    className={sx.checkbox}
                    type="checkbox"
                    checked={isChecked(row)}
                    onClick={(e) => onSelectRow(e, row)}
                    readOnly
                    testId={testId}
                />
            </label>
        </td>
    );
};
