import Loader from "./Loader";

export default function NextPrayerTime({ nextPrayer }) {
  if (!nextPrayer) {
    return <Loader size="medium" color="rgb(199, 195, 195)" />;
  }

  const hours = nextPrayer.getHours();
  const minutes = nextPrayer.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${ampm}`;
}
