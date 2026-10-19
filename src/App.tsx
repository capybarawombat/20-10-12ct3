import { useEffect, useRef, useState } from 'react';
import { Animated, useReducedMotion } from './lib/animation';
import { EnvelopeArt, Landscape, Flower } from './components/Artwork';
import { WishingTree } from './components/WishingTree';
import { Modal, WishCard } from './components/WishCard';
import { ParticleCanvas } from './effects/ParticleCanvas';
import { useWishProgress, KEY } from './hooks/useWishProgress';
import { useAudio } from './hooks/useAudio';
import { wishes, introGreeting, finaleTitle, finaleText } from './data/wishes';
export function App() {
    const { state, dispatch } = useWishProgress();
    const reduced = !!useReducedMotion();
    const audio = useAudio(state.phase === 'FINALE');
    const [shared, setShared] = useState(false);
    const [introReady, setIntroReady] = useState(false);
    const [burst, setBurst] = useState(0);
    const chopLock = useRef(false);
    const closeLock = useRef(false);
    useEffect(() => { if (state.phase !== 'INTRO_LETTER_OPEN') {
        setIntroReady(false);
        return;
    } const timer = setTimeout(() => setIntroReady(true), reduced ? 0 : 650); return () => clearTimeout(timer); }, [state.phase, reduced]);
    const isIntro = state.phase === 'INTRO' || state.phase === 'INTRO_LETTER_OPEN';
    const isFinal = state.phase === 'FINALE';
    const active = wishes.find(w => w.id === state.active);
    useEffect(() => { if (state.phase !== 'CHOPPING' || state.chops !== 3)
        return; const id = setTimeout(() => { dispatch({ type: 'FINISH' }); audio.chime(); }, reduced ? 250 : 2000); return () => clearTimeout(id); }, [state.phase, state.chops, dispatch, reduced, audio.chime]);
    useEffect(() => { closeLock.current = false; }, [state.active]);
    const openWish = (id: number) => { dispatch({ type: 'OPEN', id }); audio.chime(); setBurst(n => n + 1); };
    const closeWish = () => { if (closeLock.current)
        return; closeLock.current = true; dispatch({ type: 'CLOSE' }); audio.chime('fall'); };
    const chop = () => { if (chopLock.current || state.chops >= 3)
        return; chopLock.current = true; dispatch({ type: 'CHOP' }); audio.chime('chop'); setBurst(n => n + 1); setTimeout(() => { chopLock.current = false; }, reduced ? 100 : 450); };
    const restart = () => { try {
        localStorage.removeItem(KEY);
    }
    catch { /* In-memory restart. */ } dispatch({ type: 'RESTART' }); };
    const share = async () => { const url = location.href; try {
        if (navigator.share) {
            await navigator.share({ title: 'The Blooming Wishes · 12CT3', text: 'Một khu vườn nhỏ và 20 lời chúc dành cho bạn 🌸', url });
        }
        else {
            await navigator.clipboard.writeText(url);
            setShared(true);
        }
    }
    catch { /* Cancellation is safe; URL remains selectable below. */ } };
    return <><main className={`world ${isIntro ? 'intro-world' : ''} ${isFinal ? 'final-world' : ''}`} data-phase={state.phase}><div className="paper-grain"/><div className="sun-glow"/><Landscape /><ParticleCanvas theme={active?.animationTheme || 'blossoms'} burst={burst} celebration={isFinal} reduced={reduced}/><header className="topbar"><a className="brand" href="#" aria-label="The Blooming Wishes" onClick={e => e.preventDefault()}><svg viewBox="-20 -20 40 40" aria-hidden="true"><Flower size={1.25}/></svg><span>the blooming wishes<span className="brand-caption">A LITTLE MAGIC, JUST FOR YOU</span></span></a><div className="top-controls"><span className="date-tag">20 OCTOBER</span><button className="sound-toggle" onClick={audio.toggle} aria-label={audio.enabled ? 'Tắt âm thanh' : 'Bật âm thanh'} aria-pressed={audio.enabled}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="m11 5-5 4H3v6h3l5 4V5Z"/>{audio.enabled ? <><path d="M15 8q5 4 0 8m3-11q8 7 0 14"/></> : <path d="m16 9 5 6m0-6-5 6"/>}</svg></button></div></header>
    <>{isIntro ? <Animated.section key="intro" className="intro-content" transition={{ duration: .6 }}><div className="occasion-label"><span /> GỬI NHỮNG CÔ GÁI THẬT ĐẶC BIỆT <span /></div><h1>Một món quà nhỏ<br />dành cho <em>các bạn nữ</em> <span>12CT3</span><svg viewBox="-20 -20 40 40" aria-hidden="true"><Flower /></svg></h1><p className="intro-subtitle">Có một điều đặc biệt đang đợi bạn...</p><button className={`intro-envelope ${state.phase === 'INTRO_LETTER_OPEN' ? 'is-open' : ''}`} data-testid="intro-envelope" aria-label="Mở phong thư dành cho các bạn nữ 12CT3" onClick={() => { dispatch({ type: 'OPEN_INTRO' }); audio.chime(); }}><span className="envelope-visual"><span className="envelope-halo"/><EnvelopeArt /><span className="envelope-hint">CHẠM ĐỂ MỞ ĐIỀU BẤT NGỜ <span>↗</span></span></span></button><p className="intro-note"><span>✧</span> Một khu vườn nhỏ. Hai mươi lời chúc. Thật nhiều yêu thương.</p></Animated.section> : !isFinal ? <Animated.section key="garden" className="garden-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="garden-heading"><span className="eyebrow">KHU VƯỜN CỦA CHÚNG MÌNH</span><h1>Cây <em>điều ước</em></h1><p>{state.collected.length === 20 ? 'Mỗi điều ước là một bông hoa. Và bạn là điều đặc biệt nhất.' : 'Chạm vào những món quà trên cây để nhận lời chúc nhé! 💗'}</p></div><div className={`counter ${state.collected.length > 0 && state.collected.length % 5 === 0 ? 'milestone' : ''}`} tabIndex={-1} data-focus-fallback aria-live="polite"><span className="counter-flower">✿</span><div><span>Điều ước đã nhận</span><strong>{state.collected.length}<span> / 20</span></strong></div><div className="progress-track"><i style={{ width: `${state.collected.length * 5}%` }}/></div></div><WishingTree state={state} onWish={openWish} onLand={() => { dispatch({ type: 'LANDED' }); setBurst(n => n + 1); if ((state.collected.length + 1) % 5 === 0)
        audio.chime(); }} onChop={chop} reduced={reduced}/><div className="garden-bottom">{state.collected.length === 20 ? <Animated.div className="final-instruction" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><p>Bạn đã nhận đủ 20 lời chúc rồi! Nhưng vẫn còn một bất ngờ cuối cùng... 💖</p><strong>{state.chops === 3 ? 'Điều kỳ diệu đang nở hoa…' : 'Chạm vào thân cây 3 lần để mở món quà cuối cùng! 🪄'}</strong></Animated.div> : <><span className="tiny-star">✧</span><p>Mỗi món quà, một điều dịu dàng dành riêng cho bạn.</p><span className="garden-tip">Cứ thong thả nhé, cả khu vườn là của bạn.</span></>}</div></Animated.section> : <Animated.section key="finale" className="finale" initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }}><span className="eyebrow">HAI MƯƠI ĐIỀU ƯỚC · MỘT THỜI THANH XUÂN</span><div className="final-emblem"><svg viewBox="-35 -35 70 70" aria-hidden="true"><Flower size={2.5}/></svg><strong>12CT3</strong></div><h1>{finaleTitle}</h1><p>{finaleText}</p><span className="handwritten">Mong bạn luôn nở hoa theo cách của mình.</span><button className="primary-button" onClick={restart}>🌷 Trải nghiệm lại từ đầu</button><button className="text-button" onClick={share}>{shared ? 'Đã sao chép đường dẫn ♡' : '💌 Gửi lời chúc này cho bạn bè'}</button><a className="share-url" href={location.href}>{location.host}{location.pathname}</a></Animated.section>}</>
    <footer className="footer"><span>MADE WITH LOVE, FOR 12CT3</span><span>Thanh xuân có bạn, thật đẹp. <i>♡</i></span></footer><div className="corner-botanical left-botanical" aria-hidden="true"><svg viewBox="0 0 150 220"><path d="M0 220Q100 120 62 25m-17 126q60-11 60-53-44-1-60 53m-11 15Q-9 109 19 81q38 24 15 85" fill="#b2b69c" opacity=".55"/><Flower x={65} y={35} size={2.2}/><Flower x={26} y={103} size={1.5} color="#fff0e5"/><Flower x={100} y={111} size={1.8}/></svg></div><div className="corner-botanical right-botanical" aria-hidden="true"><svg viewBox="0 0 150 220"><path d="M0 220Q100 120 62 25m-17 126q60-11 60-53-44-1-60 53" fill="#b2b69c" opacity=".55"/><Flower x={65} y={35} size={2.2}/><Flower x={100} y={111} size={1.8} color="#fce6ce"/></svg></div>
    <>{state.phase === 'INTRO_LETTER_OPEN' && introReady && <Modal key="intro-letter" label="Lá thư gửi các bạn nữ 12CT3" onClose={() => dispatch({ type: 'ENTER' })} className="intro-letter"><span className="eyebrow">20 THÁNG 10 · MỘT LÁ THƯ NHỎ</span><h2>Gửi những cô gái<br /><em>đáng yêu của 12CT3,</em></h2>{introGreeting.slice(1).map((p, i) => <p key={i}>{p}</p>)}<span className="handwritten">Thương mến, những chàng trai 12CT3</span><button className="text-button" onClick={() => dispatch({ type: 'ENTER' })}>Chạm ra ngoài để bước vào khu vườn ✨ <span>↗</span></button></Modal>}{(state.phase === 'WISH_OPEN' || state.phase === 'WISH_CLOSING') && active && <WishCard key={`wish-${active.id}`} wish={active} closing={state.phase === 'WISH_CLOSING'} onClose={closeWish}/>}</></main></>;
}
