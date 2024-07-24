import { useLoaderData } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MyChart from '../UI/MyChart';
//import styles from './HoldingSlide.module.css';

function HotSlide() {
    //let { ticker } = useParams();
    //const hotList = useRouteLoaderData('hot');
    const hotList = useSelector((state) => state.hot);
    //console.log(holdingList);
    const slideData = useLoaderData();
    //console.log(slideData);

    return (
        <MyChart stockList={hotList && hotList.length > 0 ? hotList.slice(0).filter((h) => h.category!=='Fixed') : null} data={slideData} slideUrl={'/hot/slide/'}/>
    );
};

export default HotSlide;

