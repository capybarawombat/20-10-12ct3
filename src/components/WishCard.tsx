import { useEffect, useRef, type ReactNode } from 'react';
import { Animated } from '../lib/animation';
import { Flower, OrnamentArt } from './Artwork';
import type { Wish } from '../data/wishes';
export function Modal({ children, onClose, label, className = '' }: {
    children: ReactNode;
    onClose: () => void;
    label: string;
    className?: string;
}) { const panel = useRef<HTMLDivElement>(null); const closeRef = useRef(onClose); useEffect(() => { closeRef.current = onClose; }, [onClose]); useEffect(() => { const previous = document.activeElement as HTMLElement | null; panel.current?.focus(); const key = (e: KeyboardEvent) => { if (e.key === 'Escape')
    closeRef.current(); if (e.key === 'Tab') {
    const els = panel.current?.querySelectorAll<HTMLElement>('button,[href],[tabindex="0"]');
    if (!els?.length) {
        e.preventDefault();
        return;
    }
    const first = els[0], last = els[els.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
        e.preventDefault();
        last.focus();
    }
    else if (!e.shiftKey && (document.activeElement === last || document.activeElement === panel.current)) {
        e.preventDefault();
        first.focus();
    }
} }; addEventListener('keydown', key); return () => { removeEventListener('keydown', key); if (previous?.isConnected)
    previous.focus();
else
    document.querySelector<HTMLElement>('[data-focus-fallback]')?.focus(); }; }, []); return <Animated.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose}><Animated.div className={`letter-card ${className}`} ref={panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1} initial={{ opacity: 0, y: 55, rotate: -4, scale: .88 }} animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }} transition={{ duration: .6, ease: [.22, 1, .36, 1] }} onClick={e => e.stopPropagation()}><button className="close-button" onClick={onClose} aria-label="Đóng lời chúc">×</button><svg className="card-flower flower-top" viewBox="-30 -30 60 60" aria-hidden="true"><Flower size={1.8}/></svg>{children}<svg className="card-flower flower-bottom" viewBox="-30 -30 60 60" aria-hidden="true"><Flower size={1.8} color="#ead0b2"/></svg></Animated.div></Animated.div>; }
export function WishCard({ wish, onClose, closing = false }: {
    wish: Wish;
    onClose: () => void;
    closing?: boolean;
}) { return <Modal onClose={onClose} label={`Lời chúc số ${wish.id}`} className={`wish-card theme-${wish.animationTheme} ${closing ? 'card-closing' : ''}`}><span className="eyebrow">MỘT ĐIỀU DỊU DÀNG · {String(wish.id).padStart(2, '0')}</span><div className="card-ornament"><OrnamentArt type={wish.ornamentType} variant={wish.id % 2}/></div><span className="handwritten">Dành riêng cho bạn,</span><Animated.p className="wish-text" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .25 }}>{wish.text}</Animated.p><div className="card-divider">✧</div><p className="signature">Với thật nhiều yêu thương, <strong>12CT3</strong></p><button className="text-button" onClick={onClose}>Cất lời chúc vào tim <span>♡</span></button></Modal>; }
