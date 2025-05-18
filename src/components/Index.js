import earth from "../static/earth.png";
import rates from "../static/rates.jpg";

import { SiTether } from "react-icons/si";
import { BiDollar } from "react-icons/bi";
import { MdCurrencyYuan, MdEuro } from "react-icons/md";

import {useContext} from "react";
import {GlobalContext} from "./App";

import {Link} from "react-router";


const Index = () => {
    const globalData = useContext(GlobalContext);
    console.log(document.cookie, globalData.user);
    return (
        <div style={{ width: "100%", overflowX: "hidden", backgroundColor: "black" }} className="BodyWrapper">
            <div className="MainWrapper">
                <div style={{ display: "grid", alignItems: "stretch", height: "100%" }}>
                    <h1 style={{ textAlign: "center", color: "white" }}>
                        <br />
                        Transfer funds to any bank, anytime, using your USDT wallet<br/>
                        <span style={{fontSize:"0.5em"}}>
                        Escrow-verified peer-to-peer transactions with enhanced security protocols
                        </span>
                    </h1>
                    <div style={{ width: "100%", border: "2px solid black", display: "grid", justifyContent: "center" }}>
                        <div style={{position:"relative"}}>
                            <div style={{position:"absolute", width:"100%", height : "80%",bottom:"0", background:"linear-gradient(10deg, black, rgba(0,0,0,0.7),rgba(0,0,0,0.3), rgba(0,0,0,0.1))", boxShadow:"0px -20px 50px rgba(0,0,0,0.2)"}}>
        
                            </div>
                            <img src={rates} className="RatesImg" alt="rates" />
                        </div>
                    </div>
                </div>

                <div className="LandingA Center Vertically">
                    <div style={{ position: "absolute", width: "100%" }}>
                        <div style={{ color: "white" }} className="Center Horizontally">
                            <Link to={globalData.user ? "/rates" : "/login/rates"} className="CusLink">
                            <span style={{ fontWeight: "700", fontSize:"1.2em", backgroundColor:globalData.cusGold, borderRadius:"50vw", padding:"1vmin 2vmin", cursor:"pointer", position:"relative", zIndex:"2" }} className="Black">
                                Proceed
                            </span>
                            </Link>
                        </div>
                    </div>
                    <div style={{ position: "relative" }}>
                        <div style={{ float: "right" }}>
                            <img src={earth} className="Earth" alt="The earth"/>
                        </div>

                        <div className="Earth Center Vertically Horizontally Orbit Tether">
                            <div className="CurrIcon TetherI">
                                <SiTether />
                            </div>
                        </div>
                        <div className="Earth Center Vertically Horizontally Orbit Usd">
                            <div className="CurrIcon UsdI">
                                <BiDollar />
                            </div>
                        </div>
                        <div className="Earth Center Vertically Horizontally Orbit Yuan">
                            <div className="CurrIcon YuanI">
                                <MdCurrencyYuan />
                            </div>
                        </div>
                        <div className="Earth Center Vertically Horizontally Orbit Eur">
                            <div className="CurrIcon EurI">
                                <MdEuro />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Index;
