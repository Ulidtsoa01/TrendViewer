import { useLoaderData, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MyChart from '../UI/MyChart';
//import styles from './HoldingSlide.module.css';

function WatchSlide() {
    //console.log('WatchSlide called');
    let { watchId } = useParams();
    const watch = useSelector((state) => state.watch);
    //console.log(watch);
    //console.log(`WatchSlide: ticker=${ticker}, watchId=${watchId}`);
    const watchList = watch[watchId];
    //console.log(watchList);
    const slideData = useLoaderData();
    //console.log(slideData);

    //return <p>{ticker}</p>;
    return (
        <MyChart stockList={watchList ? watchList.slice(0).filter((h) => h.category!=='Fixed') : null} data={slideData} slideUrl={'/watch/' + watchId + '/slide/'}/>
    );
};

export default WatchSlide;

