/** Native Web Animations components. Every animation is cancelled on teardown. */
import { forwardRef, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes } from 'react';

type Pose = Record<string, number | number[] | string>;
interface AnimatedProps extends HTMLAttributes<HTMLElement> {
    initial?: Pose;
    animate?: Pose;
    transition?: { duration?: number; delay?: number; ease?: number[] };
    onAnimationComplete?: () => void;
}

function keyframe(pose: Pose, index = -1): Keyframe {
    const value = (key: string, fallback: number) => {
        const entry = pose[key] ?? fallback;
        return Array.isArray(entry) ? entry[index < 0 ? entry.length - 1 : index % entry.length] : entry;
    };
    const frame: Keyframe = {
        transform: `translate(${value('x', 0)}px, ${value('y', 0)}px) rotate(${value('rotate', 0)}deg) scale(${value('scale', 1)})`,
    };
    if ('opacity' in pose) frame.opacity = String(value('opacity', 1));
    return frame;
}

function animatedElement(tag: 'div' | 'section' | 'p') {
    return forwardRef<HTMLElement, AnimatedProps>(function AnimatedElement(
        { initial, animate, transition, onAnimationComplete, children, style, ...props }, forwarded,
    ) {
        const node = useRef<HTMLElement | null>(null);
        const firstPose = useRef(initial);
        const completion = useRef(onAnimationComplete);
        completion.current = onAnimationComplete;
        // Compare pose values, so unrelated React renders never restart a falling ornament.
        const specification = JSON.stringify(animate);
        const timing = JSON.stringify(transition);
        useEffect(() => {
            const el = node.current;
            if (!el || !specification) return;
            const target = JSON.parse(specification) as Pose;
            const options = JSON.parse(timing || '{}') as AnimatedProps['transition'];
            const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
            const count = Math.max(2, ...Object.values(target).map(v => Array.isArray(v) ? v.length : 1));
            const hasKeyframes = Object.values(target).some(Array.isArray);
            const frames = hasKeyframes
                ? Array.from({ length: count }, (_, i) => keyframe(target, i))
                : [firstPose.current ? keyframe(firstPose.current) : {
                    transform: getComputedStyle(el).transform,
                    opacity: getComputedStyle(el).opacity,
                }, keyframe(target)];
            firstPose.current = undefined;
            const finish = () => completion.current?.();
            // A static completion path also supports older in-app browsers.
            if (!el.animate) {
                Object.assign(el.style, keyframe(target));
                const timer = setTimeout(finish, 0);
                return () => clearTimeout(timer);
            }
            const animation = el.animate(frames, {
                duration: reduced ? 1 : (options?.duration ?? .5) * 1000,
                delay: reduced ? 0 : (options?.delay ?? 0) * 1000,
                easing: options?.ease ? `cubic-bezier(${options.ease.join(',')})` : 'ease-out',
                fill: 'forwards',
            });
            animation.finished.then(finish).catch(() => { /* Cancelled animations must not collect wishes. */ });
            return () => animation.cancel();
        }, [specification, timing]);
        const Tag = tag;
        return <Tag {...props} style={{ ...(initial ? keyframe(initial) : {}), ...style } as CSSProperties} ref={el => {
            node.current = el;
            if (typeof forwarded === 'function') forwarded(el);
            else if (forwarded) forwarded.current = el;
        }}>{children}</Tag>;
    });
}

export const Animated = { div: animatedElement('div'), section: animatedElement('section'), p: animatedElement('p') };

export function useReducedMotion() {
    const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
    useEffect(() => {
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        const changed = () => setReduced(media.matches);
        media.addEventListener('change', changed);
        return () => media.removeEventListener('change', changed);
    }, []);
    return reduced;
}
