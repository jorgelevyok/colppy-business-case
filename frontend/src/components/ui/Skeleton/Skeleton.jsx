/** Animated placeholder block for loading states. */
import './Skeleton.css';

export const Skeleton = ({ width = '100%', height = '100%', className = '', style = {}, ...props }) => {
    return (
        <div
            className={`skeleton ${className}`.trim()}
            style={{ width, height, ...style }}
            aria-hidden
            {...props}
        />
    );
};
