import { BiDollar } from "react-icons/bi";
import { MdCurrencyYuan, MdEuro } from "react-icons/md";
import { FaRegStar } from "react-icons/fa";
//import { Link } from "react-router";
import { GlobalContext } from "./App";
import { useContext, useState, useEffect } from "react";
import Activity from "./subs/Activity";
import { FaRegStarHalf } from "react-icons/fa";



const Rates = () => {
    const globalData = useContext(GlobalContext);
    const singleDisplayCount = 50

    const [AdList, SetAL] = useState(null);
    const [ALTD, SetALTD] = useState(null);
    // filters
    const [CNY, SetC] = useState(true);
    const [EUR, SetE] = useState(true);
    const [USD, SetU] = useState(true);
    const [currIndex, SetCI] = useState(singleDisplayCount);
    const [filter, SetFilter] = useState("Ratings");
    const [Ascending, SetAsc] = useState(false);



    const loadNext = () => {

        SetALTD([...ALTD, ...AdList.slice(currIndex, currIndex + singleDisplayCount)]);
        SetCI(currIndex + singleDisplayCount);
    };

    const filterList = (toggle) => {
        SetALTD(null);
        if (toggle === "all") {
            SetC(false);
            SetU(false);
            SetE(false);
        }
        else if (toggle === "USD") {
            USD ? SetU(false) : SetU(true);
        }
        else if (toggle === "CNY") {
            CNY ? SetC(false) : SetC(true);
        }
        else if (toggle === "EUR") {
            EUR ? SetE(false) : SetE(true);
        }
    }

    const sortList = (toggle) => {
        SetALTD(null);

        toggle === filter ? (Ascending ? SetAsc(false) : SetAsc(true)) : SetFilter(toggle);
    }



    const Filters = () => {
        return (
            <div style={{ backgroundColor: "#29303D", padding: "5vh 1vw" }}>
                <div className="IconsPad">
                    <div className="Center Horizontally Vertically IconsInnerOne">
                        <div className={"Center Vertically Horizontally " + (((CNY && EUR && USD) || (!CNY && !EUR && !USD)) && " Selected")} onClick={() => {
                            filterList("all");
                        }}>
                            <span>
                                ALL
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (CNY && "Selected")} onClick={() => {
                            filterList("CNY");
                        }}>
                            <span>
                                CNY
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (EUR && "Selected")} onClick={() => {
                            filterList("EUR");
                        }}>
                            <span>
                                EUR
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (USD && "Selected")} onClick={() => {
                            filterList("USD");
                        }}>
                            <span>
                                USD
                            </span>
                        </div>
                    </div>
                    <div className="Center Horizontally Vertically IconsInnerOne">
                        <div className={"Center Vertically Horizontally " + (filter === "Ratings" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Ratings");
                        }}>
                            <span>
                                RATINGS
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (filter === "Best Rates" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Best Rates");
                        }}>
                            <span>
                                BEST RATES
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (filter === "Minimum" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Minimum");
                        }}>
                            <span>
                                MINIMUM
                            </span>
                        </div>
                        <div className={"Center Vertically Horizontally " + (filter === "Maximum" && (!Ascending ? "SelectedA" : "Selected"))} onClick={() => {
                            sortList("Maximum");
                        }}>
                            <span>
                                MAXIMUM
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const Ads = () => {

        return (
            <div>
                <div style={{ color: "white", paddingTop: "1vh" }}>
                    {
                        ALTD === null ?
                            <Activity />
                            :
                            <div className="AdWrapper">
                                {
                                    ALTD.map((item, index) =>
                                        <div key={index} style={{ padding: "0 1vw" }} className="Center Vertically Horizontally">
                                            <div className="SingleAdWrap">
                                                <div style={{ display: "grid", gridTemplateRows: "50% 50%", height: "100%" }}>
                                                    <div style={{ padding: "2vmin" }}>
                                                        <div>
                                                            @{item['customer']['user']}
                                                        </div>
                                                        <div style={{ width: "100%" }}>
                                                            <div className="StarBox">
                                                                {
                                                                    Array.from({ length: parseInt(item['customer']['ratings']) }).map((itm, idx) =>

                                                                        <div classNAme="StarWrapper" key={idx}>
                                                                            <FaRegStar style={{ color: "#F3C31C" }} />
                                                                        </div>
                                                                    )
                                                                }
                                                                {
                                                                    parseFloat(item.customer.ratings.toString().substring(0, 3)) - parseInt(item.customer.ratings.toString().substring(0, 3)) >= 0.5 && <div className="StarWrapper"> <FaRegStarHalf style={{ color: "#F3C31C" }} /> </div>
                                                                }
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {
                                                                item.customer.ratings.toString().substring(0, 3)
                                                            }
                                                        </div>
                                                    </div>
                                                    <div style={{ display: "grid", gridTemplateColumns: "70% 30%" }}>
                                                        <div>
                                                            <div>
                                                                Minumum: $ {item['min_amount']}
                                                            </div>
                                                            <div>
                                                                Maxmimum: $ {item['max_amount']}
                                                            </div>
                                                            <div>
                                                                Rates: {item['rates'].toString().substring(0, 4)}
                                                            </div>
                                                        </div>

                                                        <div style={{ fontSize: "2em", color: globalData.cusGold }}>
                                                            {
                                                                item['currency'] === "1" && <BiDollar />
                                                            }
                                                            {
                                                                item['currency'] === "2" && <MdCurrencyYuan />
                                                            }
                                                            {
                                                                item['currency'] === "3" && <MdEuro />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                    }

                    <div className="Center Horizontally Vertically">
                        {
                            AdList !== null &&
                            <span style={{ background: globalData.cusGold, padding: "1vw 2vw", borderRadius: "10vw", margin: "2vh" }}
                                onClick={() => {

                                    loadNext();
                                }}
                            >
                                Load More
                            </span>
                        }
                    </div>
                </div>
            </div>
        )
    }
    useEffect(() => {
        (async function () {
            const resp = await fetch(globalData.BH + "/cashien/get-ads",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": globalData.cookie
                    }
                }
            );
            if (resp.status === 200) {
                const result = await resp.json();
                console.log(result);
                SetAL(result['ads']);
                SetALTD(result['ads'].slice(0, 50));
            }
        })();
    }, [globalData.BH, globalData.cookie]);

    useEffect(() => {
        console.log("State");
        SetAL(prev => {
            if (prev !== null) {
                switch (filter) {
                    case "Ratings":
                        return Ascending ? [...prev].sort((a, b) => b.customer.ratings - a.customer.ratings) : [...prev].sort((a, b) => a.customer.ratings - b.customer.ratings);


                    case "Best Rates":
                        return Ascending ? [...prev].sort((a, b) => b.rate_floor - a.rate_floor) : [...prev].sort((a, b) => a.rate_floor - b.rate_floor);


                    case "Minimum":
                        return Ascending ? [...prev].sort((a, b) => b.min_amount - a.min_amount) : [...prev].sort((a, b) => a.min_amount - b.min_amount);


                    case "Maximum":
                        return Ascending ? [...prev].sort((a, b) => b.max_amount - a.max_amount) : [...prev].sort((a, b) => a.max_amount - b.max_amount);

                    default:
                        return prev;

                }
            }

            return prev;
        });
    }, [USD, CNY, EUR, Ascending, filter]);

    useEffect(() => {
        console.log("state");
        if (AdList !== null) {
            if (!CNY && !USD && !EUR) {
                SetALTD(AdList.slice(0, singleDisplayCount));
            } else {
                const newList = AdList.filter((item) =>
                    (item.currency === "1" && USD) || (item.currency === "2" && CNY) || (item.currency === "3" && EUR)
                );
                SetALTD(newList.slice(0, singleDisplayCount));
            }
        }
    }, [AdList, CNY, USD, EUR]);

    return (
        <div className="PagePad">
            <Filters />
            <Ads />
        </div>
    )
}

export default Rates;