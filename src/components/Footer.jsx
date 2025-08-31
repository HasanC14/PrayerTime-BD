import { FaGithub, FaFacebook, FaLinkedinIn } from "react-icons/fa";
export default function Footer() {
  return (
    <div className="footer">
      <a
        href="https://github.com/HasanC14/PrayerTime-BD"
        target="_blank"
        rel="noreferrer"
      >
        <FaGithub />
      </a>
      <a
        href="https://www.facebook.com/hasan.chowdhuryD/"
        target="_blank"
        rel="noreferrer"
      >
        <FaFacebook />
      </a>
      <a
        href="https://www.linkedin.com/in/hasanchowdhuryd/"
        target="_blank"
        rel="noreferrer"
      >
        <FaLinkedinIn />
      </a>
    </div>
  );
}
