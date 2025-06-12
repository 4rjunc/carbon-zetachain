// add overview of the app
// add typing effect of share, buy, sell words

const Banner = () => {
  return (
   <div className="bg-[#fffcf2] h-screen flex items-center justify-center"
        style={{ 
          overflow: 'hidden',
          position: 'fixed',
        }}>
      <div className="text-center px-4 max-w-4xl mx-auto">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 text-[#252422]">           
        C<span className="text-[#eb5e28]">a</span>rbon         
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-4 text-[#eb5e28] font-semibold italic">
            Fueling Minds, Igniting Discovery
        </p>
        <p className="font-mono text-base sm:text-lg md:text-2xl lg:text-3xl mb-2 text-[#403d39]">
          Your Marketplace for Scientific Knowledge
        </p>
        <p className="font-mono text-base sm:text-lg md:text-xl text-[#403d39]">
          Buy and Sell Research Papers and Notes
        </p>
        <div className="mt-4 w-16 sm:w-20 md:w-24 h-1 bg-[#eb5e28] mx-auto"></div>
    </div>
  </div>
  );
};

export default Banner;