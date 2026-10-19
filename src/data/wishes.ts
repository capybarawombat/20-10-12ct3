export const ornamentTypes = ['envelope', 'lucky', 'sakura', 'rose', 'fruit', 'candy', 'bow', 'star', 'heart', 'gift'] as const;
export const themes = ['fireworks', 'blossoms', 'snow', 'glitter', 'shooting', 'hearts', 'roses', 'butterflies', 'candy', 'stardust'] as const;
export type OrnamentType = typeof ornamentTypes[number];
export type Theme = typeof themes[number];
export interface Wish {
    id: number;
    text: string;
    ornamentType: OrnamentType;
    animationTheme: Theme;
    position: {
        x: number;
        y: number;
    };
    collected: boolean;
}
const texts = [
    'Chúc bạn luôn xinh đẹp, rạng rỡ và có thật nhiều lý do để mỉm cười mỗi ngày! 🌷',
    'Mong rằng mọi điều dịu dàng nhất trên thế giới đều sẽ tìm đến bạn. 💗',
    'Chúc bạn luôn tự tin với chính mình, vì bạn tuyệt vời hơn bạn nghĩ rất nhiều! ✨',
    'Tuổi 18 thật đẹp nhé! Hãy cứ mơ lớn, sống hết mình và đừng ngại tỏa sáng. 🌟',
    'Chúc những bài kiểm tra trở nên dễ dàng, những con điểm trở nên xinh đẹp và những ngày đi học luôn vui! 📚',
    'Mong bạn sẽ luôn gặp được những người tử tế, những điều dễ thương và những cơ hội tuyệt vời. 🍀',
    'Chúc bạn không chỉ có một ngày 20/10 vui vẻ mà còn có 365 ngày được yêu thương! 💕',
    'Dù tương lai đưa chúng ta đến đâu, mong bạn vẫn giữ được nụ cười thật tươi như hôm nay. 🌸',
    'Chúc bạn có đủ dũng khí theo đuổi ước mơ và đủ bình yên để tận hưởng hành trình ấy. 🦋',
    'Mong rằng những ngày mệt mỏi sẽ có người lắng nghe, những ngày vui sẽ có người cùng sẻ chia. 💌',
    'Chúc bạn luôn là phiên bản hạnh phúc nhất của chính mình, không cần phải giống bất kỳ ai. 🎀',
    'Một chút may mắn, một chút phép màu và thật nhiều niềm vui dành riêng cho bạn hôm nay! ⭐',
    'Chúc bạn luôn được trân trọng, được yêu thương và được là chính mình. 🌹',
    'Mong cho thanh xuân của bạn có những chuyến đi đáng nhớ và những câu chuyện thật đẹp. 🍬',
    'Chúc bạn bước vào kỳ thi sắp tới với sự tự tin, bình tĩnh và kết quả thật xứng đáng! 📖',
    'Mong rằng mọi nỗ lực thầm lặng của bạn rồi sẽ nở hoa vào một ngày thật đẹp. 🌼',
    'Chúc bạn luôn có những người bạn tốt, những kỷ niệm đẹp và một trái tim đầy ắp niềm vui. 💝',
    'Hy vọng bạn sẽ luôn tìm thấy ánh sáng nhỏ bé ngay cả trong những ngày nhiều mây. ☀️',
    'Chúc bạn có một tuổi học trò thật đáng nhớ, để sau này nhìn lại vẫn thấy lòng mình ấm áp. 🎁',
    'Cảm ơn vì đã cùng tạo nên những năm tháng tuyệt vời của 12CT3. Chúc bạn một ngày 20/10 thật hạnh phúc! 🌺',
];
// Four staggered rows. Minimum anchor separation is >44px even at 360px.
const positions = [[16, 26], [33, 26], [50, 24], [67, 26], [84, 28], [9, 40], [28, 39], [47, 38], [66, 40], [85, 41], [15, 53], [34, 52], [53, 52], [72, 54], [91, 54], [12, 66], [31, 65], [50, 65], [69, 67], [88, 67]];
export const wishes: Wish[] = texts.map((text, i) => ({ id: i + 1, text, ornamentType: ornamentTypes[i % 10], animationTheme: themes[i % 10], position: { x: positions[i][0], y: positions[i][1] }, collected: false }));
export const introGreeting = ['Gửi những cô gái đáng yêu của 12CT3,', 'Nhân ngày 20/10, chúc các bạn luôn rạng rỡ, tự tin và hạnh phúc theo cách riêng của mình. Mong rằng tuổi 17, 18 của chúng ta sẽ thật đáng nhớ, với những kỷ niệm đẹp, những tiếng cười và thật nhiều điều tuyệt vời phía trước.', 'Cảm ơn các bạn đã là một phần thanh xuân của 12CT3.', 'Và đây là một khu vườn nhỏ, nơi 20 lời chúc đặc biệt đang đợi được khám phá... 🌸'];
export const finaleTitle = 'CHÚC CÁC BẠN NỮ LỚP 12CT3 20/10 VUI VẺ! 💖🌸';
export const finaleText = 'Chúc những cô gái của 12CT3 luôn xinh đẹp, hạnh phúc, tự tin và tỏa sáng theo cách riêng của mình. Cảm ơn vì đã làm thanh xuân của chúng ta trở nên đặc biệt!';
