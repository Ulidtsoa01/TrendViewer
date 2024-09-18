import { useLoaderData } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MyChart from '../UI/MyChart';

function HoldingSlide() {
    const holdingList = useSelector((state) => state.holdings);
    //console.log(holdingList);
    const slideData = useLoaderData();
    //console.log(slideData);

    return (
        <MyChart stockList={holdingList && holdingList.length > 0 ? holdingList.slice(0).filter((h) => h.category!=='Fixed') : null} data={slideData} slideUrl={'/holdings/slide/'}/>
    );
};

export default HoldingSlide;

