import { useState, useEffect } from "react";
import ActivityTable from "./ActivityTable";

function TradeActivities(props) {
    const [activityList, setActivityList] = useState(null);

    useEffect(() => {
        fetch('/rest/account/tradeactivities').then((response) => {
            // console.log(response);
            if (response.ok) {
                response.json().then((activities) => {
                    // console.log("Trade activities loaded.");
                    // console.log(activities);
                    setActivityList(activities.reverse());
                });
            }
        }).catch((err) => {
            console.error(err);
        });
    }, []); // will only run once

    return (
        <ActivityTable activityList={activityList} />
    );
}

export default TradeActivities;