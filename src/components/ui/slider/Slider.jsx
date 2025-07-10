import Img from "../../../assets/images/sliderIMG.jpg";

const InfiniteSliderPage = () => {
  return (
    <div className="relative w-full h-64 overflow-hidden bg-gray-900/10">
      {/* Slider Container with infinite scrolling */}
      <div className="flex w-full h-full animate-scroll-left-right">
        {/* Duplicate the image to create a continuous loop */}
        <div className="flex-shrink-0">
          <img
            src={Img}
            alt="Slide"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
        <div className="flex-shrink-0 w-full">
          <img
            src={Img}
            alt="Slide"
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default InfiniteSliderPage;
