import { FaGithub, FaFacebook, FaLinkedinIn, FaHeart } from "react-icons/fa";
import { SiBuymeacoffee } from "react-icons/si";

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-text">
        Made with <FaHeart className="heart-icon" /> by{" "}
        <a
          href="https://hasanchowdhury.com"
          target="_blank"
          rel="noreferrer"
        >
          Hasan
        </a>
      </div>
      <div className="social-links">
        <a
          href="https://github.com/HasanC14/PrayerTime-BD"
          target="_blank"
          rel="noreferrer"
          title="GitHub"
        >
          <FaGithub />
        </a>
        <a
          href="https://www.facebook.com/dev.hasanchowdhury/"
          target="_blank"
          rel="noreferrer"
          title="Facebook"
        >
          <FaFacebook />
        </a>
        <a
          href="https://www.linkedin.com/in/md-hasanchowdhury/"
          target="_blank"
          rel="noreferrer"
          title="LinkedIn"
        >
          <FaLinkedinIn />
        </a>
        <a
          href="#"
          target="_blank"
          rel="noreferrer"
          title="Buy me a coffee"
        >
          <SiBuymeacoffee />
        </a>
      </div>
    </div>
  );
}
