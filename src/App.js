import React, { useState, useEffect } from "react";
import {
  DateRangePicker,
  SingleDatePicker,
  DayPickerRangeController,
} from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import "./Assets/style.css";
import Moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { isMobile } from "react-device-detect";

const App = (props) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState("startDate");
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(Moment());
  const [defaultDate, setDefaultDate] = useState(Moment());

  useEffect(() => {
    Moment.locale("fr");
    loadItems();
  }, []);

  const changeDate = ({ startDateNew, endDateNew }) => {
    const { config } = props;
    const { onClickItem } = config;

    if (startDateNew) {
      const elem = isDayHighlighted(startDateNew);
      if ("id" in elem) {
        try {
          if (!startDate) {
            onClickItem(elem);
          }
        } catch (e) {
          console.error(e);
        }
        return false;
      }
    }

    if (endDateNew) {
      const elem = isDayHighlighted(endDateNew);
      if ("id" in elem) {
        try {
          if (!startDate) {
            onClickItem(elem);
          }
        } catch (e) {
          console.error(e);
        }
        return false;
      }
    }

    if (startDate && endDate) {
      reset();
      setStartDate(startDateNew);
      setEndDate(null);
      setFocusedInput("endDate");
    } else {
      setStartDate(startDateNew);
      setEndDate(endDateNew);
    }

    const prices = getPricePerDay(startDateNew);

    try {
      props.config.setDateRange(startDateNew, endDateNew, prices);
    } catch (e) {
      console.log(e);
    }
  };

  const setDateRange = () => {
    if (startDate && endDate) {
      props.config.onSetDateRange(startDate, endDate);
    } else {
      props.config.onSetDateRangeFailed("please select date range!");
    }
  };

  const isOutsideRange = (day) => {
    if (Moment().startOf("day") > day.startOf("day")) {
      return true;
    }

    if (startDate && !endDate) {
      const closest = findClosestDate(startDate);
      return closest
        ? day.isAfter(closest) ||
            day.format("YYYY-MM-DD") === closest.format("YYYY-MM-DD")
        : closest;
    } else {
      return false;
    }
  };

  const findClosestDate = (date) => {
    let closest = date;
    items.forEach((element) => {
      let searchClosest = true;
      if ("id" in element) {
        if (element.id === "price") {
          searchClosest = false;
        }
      }
      if (searchClosest) {
        const start = element.start;
        const startDate = Moment(start, "YYYY-MM-DD HH:mm:ss");
        if (
          startDate.startOf("day").format() === date.startOf("day").format()
        ) {
          closest = startDate;
        } else if (startDate.isAfter(date) && startDate.isBefore(closest)) {
          closest = startDate;
        } else if (startDate.isAfter(date) && closest === date) {
          closest = startDate;
        }
      }
    });
    return date === closest ? false : closest;
  };

  const isDayHighlighted = (day) => {
    const day2 = day.format("YYYY-MM-DD");
    let reservedDay = [];
    if (items) {
      items.forEach((element) => {
        let searchClosest = true;
        if ("id" in element) {
          if (element.id === "price") {
            searchClosest = false;
          }
        }
        if (searchClosest) {
          const start = element.start;
          const end = element.end;
          const startDate = Moment(start, "YYYY-MM-DD HH:mm:ss");
          const endDate = Moment(end, "YYYY-MM-DD HH:mm:ss");
          const endDate2 = endDate.format("YYYY-MM-DD");
          if (isDayReserved(day, startDate, endDate) && day2 !== endDate2) {
            reservedDay = element;
          }
        }
      });
    }
    return reservedDay;
  };

  const getPricePerDay = (day) => {
    let elementRes = null;
    if (items) {
      items.forEach((element) => {
        let search = false;
        if ("id" in element) {
          if (element.id === "price") {
            search = true;
          }
        }
        if (search) {
          const start = element.start;
          const end = element.end;
          const startDate = Moment(start, "YYYY-MM-DD");
          const endDate = Moment(end, "YYYY-MM-DD");
          if (isDayReserved(day, startDate, endDate) && !elementRes) {
            elementRes = element;
          }
        }
      });
    }
    return elementRes;
  };

  const isDayReserved = (day, startDate, endDate) => {
    return day ? day.isBetween(startDate, endDate, null, "[]") : false;
  };

  const reset = () => {
    setStartDate(null);
    setEndDate(null);
    setFocusedInput("startDate");
  };

  const onFocusChange = (focusedInput) => {
    setFocusedInput(focusedInput || "startDate");
  };

  const loadItems = (currentDateSet = null) => {
    const { config } = props;
    const { url } = config;
    currentDateSet =
      (currentDateSet ? currentDateSet.clone() : false) || currentDate.clone();
    let firstDate = currentDateSet
      .clone()
      .subtract(2, "months")
      .startOf("month")
      .format("YYYY-MM-DD");
    const lastDate = currentDateSet
      .clone()
      .add(2, "months")
      .endOf("month")
      .format("YYYY-MM-DD");
    if (startDate) {
      firstDate = startDate.clone().format("YYYY-MM-DD");
    }

    setIsLoaded(false);
    setCurrentDate(currentDateSet.clone());

    const urlFetch = `${url}&start=${firstDate}&end=${lastDate}`;

    fetch(urlFetch)
      .then((res) => res.json())
      .then(
        (result) => {
          setIsLoaded(true);
          setItems(result);
        },
        (error) => {
          setIsLoaded(true);
          setError(error);
        }
      );
  };

  const onNextMonths = (currentDate) => {
    loadItems(currentDate);
    setCurrentDate(currentDate);
  };

  const onPrevMonths = (currentDate) => {
    loadItems;
    loadItems(currentDate);
    setCurrentDate(currentDate);
  };

  const refresh = () => {
    loadItems();
  };

  const getYears = () => {
    const now = Moment();
    const year = parseInt(now.format("YYYY"));
    const years = [];
    let i = year - 5;
    while (i <= year + 5) {
      years.push(i);
      i += 1;
    }
    return years;
  };

  const onChangeSelectDatesMonth = (month) => {
    const newDate = currentDate.clone();
    newDate.month(month);
    loadItems(newDate);
  };

  const onChangeSelectDatesYear = (year) => {
    const newDate = currentDate.clone();
    newDate.year(year);
    loadItems(newDate);
  };

  const checkClsDayStartOrEndDate = (day) => {
    let clsArray = {};
    let dayFormat = day.format("YYYY-MM-DD");

    if (items) {
      items.forEach((elem) => {
        let searchClosest = true;
        if ("id" in elem) {
          if (elem.id === "price") {
            searchClosest = false;
          }
        }
        if (searchClosest) {
          const start = elem.start;
          const end = elem.end;
          const startDate = Moment(start, "YYYY-MM-DD HH:mm:ss");
          const endDate = Moment(end, "YYYY-MM-DD HH:mm:ss");

          if (isDayReserved(day, startDate, endDate)) {
            let cls = "";
            if (
              elem.totalPrice &&
              parseInt(elem.totalPrice) === parseInt(elem.paidPrice)
            ) {
              cls = "paid";
            } else if (elem.totalPrice && elem.paidPrice === 0) {
              cls = "partially-reserved";
            } else if (
              elem.totalPrice &&
              parseInt(elem.totalPrice) > parseInt(elem.paidPrice)
            ) {
              cls = "reserved";
            }

            let clsStart2 = "";
            let clsEnd2 = "";

            if (dayFormat === startDate.format("YYYY-MM-DD")) {
              if (
                elem.totalPrice &&
                parseInt(elem.totalPrice) === parseInt(elem.paidPrice)
              ) {
                clsStart2 = "paid";
              } else if (elem.totalPrice && elem.paidPrice === 0) {
                clsStart2 = "partially-reserved";
              } else if (
                elem.totalPrice &&
                parseInt(elem.totalPrice) > parseInt(elem.paidPrice)
              ) {
                clsStart2 = "reserved";
              }
            }

            if (dayFormat === endDate.format("YYYY-MM-DD")) {
              if (
                elem.totalPrice &&
                parseInt(elem.totalPrice) === parseInt(elem.paidPrice)
              ) {
                clsEnd2 = "paid";
              } else if (elem.totalPrice && elem.paidPrice === 0) {
                clsEnd2 = "partially-reserved";
              } else if (
                elem.totalPrice &&
                parseInt(elem.totalPrice) > parseInt(elem.paidPrice)
              ) {
                clsEnd2 = "reserved";
              }
            }

            if (!(dayFormat in clsArray)) {
              clsArray[dayFormat] = {
                cls: null,
                clsStart: null,
                clsEnd: null,
              };
            }

            if (cls && !clsArray[dayFormat].cls) {
              clsArray[dayFormat].cls = cls;
            }

            if (clsStart2 && !clsArray[dayFormat].clsStart) {
              clsArray[dayFormat].clsStart = clsStart2;
            }

            if (clsEnd2 && !clsArray[dayFormat].clsEnd) {
              clsArray[dayFormat].clsEnd = clsEnd2;
            }
          }
        }
      });
    }

    if (dayFormat in clsArray) {
      if (clsArray[dayFormat].clsStart && clsArray[dayFormat].clsEnd) {
        const clsStart =
          clsArray[dayFormat].clsStart + " day-item-status start-date";
        const clsEnd = clsArray[dayFormat].clsEnd + " day-item-status end-date";
        return (
          <React.Fragment>
            <div className={clsStart}></div>
            <div className={clsEnd}></div>
          </React.Fragment>
        );
      } else if (clsArray[dayFormat].clsStart) {
        const clsStart =
          clsArray[dayFormat].clsStart + " day-item-status start-date";
        return (
          <React.Fragment>
            <div className={clsStart}></div>
          </React.Fragment>
        );
      } else if (clsArray[dayFormat].clsEnd) {
        const clsEnd = clsArray[dayFormat].clsEnd + " day-item-status end-date";
        return (
          <React.Fragment>
            <div className={clsEnd}></div>
          </React.Fragment>
        );
      } else if (clsArray[dayFormat].cls) {
        const cls = clsArray[dayFormat].cls + " day-item-status";
        return (
          <React.Fragment>
            <div className={cls}></div>
          </React.Fragment>
        );
      }
    }

    return (
      <React.Fragment>
        <div></div>
      </React.Fragment>
    );
  };

  const renderCalendarInfo = () => {
    return (
      <div className={"container-color-info"}>
        <div className="color paid"></div>
        &nbsp;
        <div className={"color-info"}>Reservé</div>
        <br />
        <div className="color reserved"></div>
        &nbsp;
        <div className={"color-info"}>Demande en attente</div>
        <br />
        <div className="color partially-reserved"></div>
        &nbsp;
        <div className={"color-info"}>Partiellement reservé</div>
        <br />
        <div className="color"></div>
        &nbsp;
        <div className={"color-info"}>Disponible</div>
        <br />
      </div>
    );
  };

  return (
    <LoadingOverlay active={!isLoaded} spinner>
      <div className={"container-date-range"}>
        <DayPickerRangeController
          disabled={!isLoaded}
          startDate={startDate}
          endDate={endDate}
          onDatesChange={({ startDate, endDate }) =>
            changeDate({
              startDateNew: startDate,
              endDateNew: endDate,
            })
          }
          focusedInput={focusedInput}
          onFocusChange={(focusedInput) => onFocusChange(focusedInput)}
          numberOfMonths={isMobile ? 1 : 3}
          isDayHighlighted={(day) => {
            const elem = isDayHighlighted(day);
            return "id" in elem;
          }}
          isOutsideRange={(day) => isOutsideRange(day)}
          minimumNights={0}
          enableOutsideDays={false}
          onPrevMonthClick={(currentDate) => onNextMonths(currentDate)}
          onNextMonthClick={(currentDate) => onPrevMonths(currentDate)}
          renderMonthElement={({ month, onMonthSelect, onYearSelect }) => {
            return (
              <div
                key={`select-${month}-${month.year()}`}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <div>
                  <select
                    className={"form-control"}
                    value={month.month()}
                    onChange={(e) => {
                      onMonthSelect(month, e.target.value);
                      onChangeSelectDatesMonth(e.target.value);
                    }}
                  >
                    {Moment.months().map((label, value) => (
                      <option value={value} key={`moenth-item-${value}`}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    className={"form-control"}
                    onChange={(e) => {
                      onYearSelect(month, e.target.value);
                      onChangeSelectDatesYear(e.target.value);
                    }}
                    value={month.year()}
                  >
                    {getYears().map((elem, k) => {
                      return (
                        <option key={`year-key-${elem}`} value={elem}>
                          {elem}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            );
          }}
          renderDayContents={(day) => {
            const cls = checkClsDayStartOrEndDate(day);
            return (
              <React.Fragment>
                <div className={"day-item-container"}>
                  <div className={"day-item"}>{day.format("DD")}</div>
                  {cls}
                </div>
              </React.Fragment>
            );
          }}
          renderCalendarInfo={renderCalendarInfo}
        />
        {props.config.buttonSetDateRange && (
          <button
            type={"button"}
            className={"btn btn-default btn-daterange-set"}
            onClick={() => {
              setDateRange();
              return false;
            }}
          >
            <i className="fa fa-check" aria-hidden="true"></i>
          </button>
        )}
        {props.config.buttonClear && (
          <button
            type={"button"}
            className={"btn btn-default btn-daterange-clear"}
            onClick={() => {
              reset();
              return false;
            }}
          >
            <i className="fa fa-times" aria-hidden="true"></i>
          </button>
        )}
        {props.config.buttonRefresh && (
          <button
            type={"button"}
            className={"btn btn-default btn-daterange-refresh"}
            onClick={() => {
              refresh();
              return false;
            }}
          >
            <i className="fa fa-refresh" aria-hidden="true"></i>
          </button>
        )}
      </div>
    </LoadingOverlay>
  );
};

export default App;
