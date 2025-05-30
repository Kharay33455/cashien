import { MdExpandMore, MdExpandLess } from "react-icons/md";
import { GlobalContext } from "./App";
import { useContext, useEffect, useState } from "react";
import Activity from "./subs/Activity";
import { DisplayMessage } from "./AuxFuncs";

const Faq = () => {
    const globalData = useContext(GlobalContext);
    const [Faqs, SetFaqs] = useState(null);
    const [selected, SetSelected] = useState(null);

    useEffect(() => {
        (async function () {
            try {
                const resp = await fetch(globalData.BH + "/cashien/get-faqs");
                if (resp.status === 200) {
                    const result = await resp.json();
                    SetFaqs(result['faqs'])
                    console.log(result);
                }

            } catch {
                DisplayMessage("An unexpected error has occured.", "red");
            }

        })();

    }, [globalData.BH]);

    return (
        <div style={{ minHeight: "100vh", background: "black", color: globalData.cusGray }}>
            <div>
                <div>
                    <h1 style={{ width: "max-content", borderBottom: "2px solid " + globalData.cusGold, paddingTop: "10vh", paddingRight: "2vw" }}>
                        Frequently asked questions
                    </h1>
                    <p>
                        We are here to help you with anything and everything.
                    </p>
                </div>

                <div style={{ padding: "0vh 1vh", paddingBottom: "10vh" }}>
                    {
                        Faqs !== null
                            ?

                            Faqs.map((item) =>
                                <div key={item.id} style={{ padding: "1vh 1vh", border: "0.1vmin ridge " + globalData.cusGold, background: globalData.cusBlack, margin: "1vh 0" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "80% 20%" }}>
                                        <div>
                                            <span style={{ fontWeight: "700" }}>
                                                {item.question}
                                            </span>
                                        </div>
                                        <div className="Center Horizontally Vertically" onClick={() => {
                                            if (selected === item.id) {
                                                SetSelected(null);
                                            } else {
                                                SetSelected(item.id)
                                            }
                                        }}>
                                            {
                                                selected === item.id ?

                                                    <MdExpandLess />
                                                    :
                                                    <MdExpandMore />
                                            }
                                        </div>
                                    </div>
                                    <div style={{ padding: "0 1vh", fontSize: "0.8em", maxHeight: selected === item.id ? "300px" : "0", overflow: "hidden", opacity: selected === item.id ? "1" : "0", transition: "opacity 1s linear, max-height 0.5s linear" }}>
                                        <p>
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>
                            )
                            :
                            <Activity />
                    }

                </div>


            </div>

        </div>
    )
}

export default Faq;