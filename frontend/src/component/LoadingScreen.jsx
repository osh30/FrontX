import logo from '../assets/logo/frontx-logo.svg';

const LoadingScreen = ({ dark = false }) => {
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${dark ? 'bg-slate-950' : 'bg-white'}`}>
      <img
        src={logo}
        alt="Frontx"
        className="w-16 h-16 object-contain animate-pulse"
      />
    </div>
  );
};

export default LoadingScreen;
