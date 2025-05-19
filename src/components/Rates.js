import { LuEqualApproximately } from "react-icons/lu";
import { FaWindowClose } from "react-icons/fa";
import { BiDollar } from "react-icons/bi";
import { MdCurrencyYuan, MdEuro } from "react-icons/md";
import { FaRegStar } from "react-icons/fa";
//import { Link } from "react-router";
import { GlobalContext } from "./App";
import { useContext, useState, useEffect, useRef } from "react";
import Activity from "./subs/Activity";
import { FaRegStarHalf } from "react-icons/fa";
import { addComma } from "./AuxFuncs";


// default function
const Rates = () => {
    const alphabets = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    const startBox = useRef(null);
    const globalData = useContext(GlobalContext);// global data
    const singleDisplayCount = 50   // how much data is shown at once

    const [AdList, SetAL] = useState(null); // ads from server
    const [ALTD, SetALTD] = useState(null); // sorted add to user preference
    // filters
    const [CNY, SetC] = useState(true);
    const [EUR, SetE] = useState(true);
    const [USD, SetU] = useState(true);

    const [currIndex, SetCI] = useState(singleDisplayCount);    // how much data has been read so far
    const [filter, SetFilter] = useState("Ratings");    // sort by 
    const [Ascending, SetAsc] = useState(true);    // sort order

    const [selected, SetSelected] = useState(null);


    // load next {singleDisplayCount} of list
    const loadNext = () => {

        SetALTD([...ALTD, ...AdList.slice(currIndex, currIndex + singleDisplayCount)]);
        SetCI(currIndex + singleDisplayCount);
    };

    // update currency filters
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

    // sort list by chosen category. Default is ratings
    const sortList = (toggle) => {
        SetALTD(null);

        toggle === filter ? (Ascending ? SetAsc(false) : SetAsc(true)) : SetFilter(toggle);
    }


    const formatInput = (fmtType, fmtRate) => {
        const usdtElem = document?.getElementById("inputusdt");
        const otherElem = document?.getElementById("inputother");
        const inputAmt = fmtType === "usdtToOther" ? usdtElem.value : otherElem.value;

        let finalFmt = "";

        Array.from(inputAmt).forEach((item, index) => {
            if (alphabets.includes(item)) {
                finalFmt += item;
            }
        }
        )



        const otherNum = (fmtType === "usdtToOther" ? parseFloat(finalFmt) * fmtRate : parseFloat(finalFmt) / fmtRate).toString();
        const otherNumFinalFmt = !(finalFmt.length < 1 || Number(finalFmt) === 0) ? addComma(otherNum.split(".")[0]) + "." + otherNum.split(".")[1].substring(0, 3) : "0.00";

        if (fmtType === "usdtToOther") {
            usdtElem.value = addComma(finalFmt);
            otherElem.value = otherNumFinalFmt;
        } else {
            usdtElem.value = otherNumFinalFmt;
            otherElem.value = addComma(finalFmt);
        }

    }

    // filter bar
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


    // Ad list 
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
                                        <div key={index} style={{ padding: "0 1vw" }} className="Center Vertically Horizontally"
                                            onClick={
                                                () => {
                                                    SetSelected(item);
                                                }}
                                        >
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


    const StartTransaction = () => {
        return (
            <div style={{ position: "fixed", background: "linear-gradient(180deg,rgba(41, 48, 61, 0.2), rgba(243, 195, 28, 0.2),  rgba(41, 48, 61, 0.2))", width: "100%", height: "100vh", opacity: "0", zIndex: "-1", transition: "opacity 0.9s linear" }} ref={startBox} id="startBox">
                <div className="Center Vertically" style={{ height: "100%" }}>
                    <div>

                        <div style={{ display: "grid", justifyContent: "flex-end" }}>
                            <div style={{ margin: "2vw" }}>
                                <FaWindowClose style={{ color: "red", background: "white", fontSize: "1.5em" }} onClick={() => {
                                    SetSelected(null);
                                }} />
                            </div>
                        </div>
                        <div style={{ background: globalData.cusBlack, color: "white", paddingBottom:"10%" }}>
                            {
                                selected !== null &&

                                <div style={{ padding: "2vw" }}>
                                    <div>
                                        <span style={{ fontSize: "2em" }}>
                                            @{selected.customer.user}<br />
                                        </span>
                                        <span style={{ fontSize: "1.5em" }}>
                                            $&nbsp;{selected.min_amount} - $&nbsp;{selected.max_amount} at {selected.rates.toString().substring(0, 4)}/USDT
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="InputBox">
                                        <div style={{ display: "flex" }} className="Center Vertically Horizontally">
                                            <div>
                                                <input type="text" className="dark" id="inputusdt" onInput={() => {
                                                    formatInput("usdtToOther", selected.rates);
                                                }} />
                                            </div>
                                            <div className="Center Vertically" style={{ fontSize: "1.5em" }}>
                                                &nbsp;USDT
                                            </div>
                                        </div>
                                        <div className="Center Vertically Horizontally">
                                            <span>
                                                &nbsp;
                                                <LuEqualApproximately style={{ fontSize: "1.5em" }} />
                                                &nbsp;
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", gap: "1vw" }} className="Center Vertically Horizontally">
                                            <div className="Center Vertically" style={{ fontSize: "1.5em" }}>
                                                {
                                                    selected.currency === "1" && <BiDollar />
                                                }
                                                {
                                                    selected.currency === "2" && <MdCurrencyYuan />
                                                }
                                                {
                                                    selected.currency === "3" && <MdEuro />
                                                }
                                            </div>
                                            <div>
                                                <input type="text" className="dark" id="inputother" onInput={() => {
                                                    formatInput("otherToUsdt", selected.rates);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                    <hr />
                                    <div style={{ display: "grid", gap: "2vh" }}>
                                        <div>
                                            <input type="text" className="dark" placeholder="Bank Name" />
                                        </div>
                                        <div>
                                            <input type="text" className="dark" placeholder="Account/Routing Number" />
                                        </div>
                                        <div>
                                            <input type="text" className="dark" placeholder="Receiver Name" />
                                        </div>
                                        <div>
                                            <input type="text" className="dark" placeholder="Remark(Optional)" />
                                        </div>
                                    </div>
                                    <hr/>
                                    <div className="Center Horizontally">
                                        <span style={{ fontWeight: "700", fontSize: "1.2em", backgroundColor: globalData.cusGold, borderRadius: "1vw", padding: "1vmin 2vmin", cursor: "pointer", color: "black" }}>
                                            Proceed
                                        </span>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        )
    }


    // check if an ad is slected or not, show proceed screen if so
    useEffect(() => {

        if (startBox.current) {
            requestAnimationFrame(() => {
                startBox.current.style.opacity = selected === null ? "0" : "1";
            });
            if (selected !== null) {
                startBox.current.style.zIndex = "1";
            } else {
                setTimeout(() => {
                    startBox.current.style.zIndex = "-1";
                }, 1000);
            }
        }
        console.log("update state");
    }, [selected, startBox]);





    // fetch data from back end
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


    // sort data on currency filter
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


    // update display list every time data is changed
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
            <div style={{ position: "relative" }}>
                <StartTransaction />
            </div>
            <Filters />
            <Ads />
        </div>
    )
}

export default Rates;