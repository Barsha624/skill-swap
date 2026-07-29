export default function Runes() {
  const symbols = ["✦", "✧", "☾", "☽", "✩", "✪", "⚝"];

  const runes = Array.from({ length: 20 }).map((_, i) => {
    const style = {
      left: Math.random() * 100 + "vw",
      animationDuration: 10 + Math.random() * 10 + "s",
      fontSize: 20 + Math.random() * 20 + "px"
    };

    return (
      <span key={i} className="rune" style={style}>
        {symbols[Math.floor(Math.random() * symbols.length)]}
      </span>
    );
  });

  return <div className="runes">{runes}</div>;
}