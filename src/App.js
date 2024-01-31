import React, { useState, useEffect } from "react";
import { DayPickerRangeController, CalendarDay } from "react-dates";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import "./Assets/style.css";
import Moment from "moment";
import LoadingOverlay from "react-loading-overlay";
import { isMobile } from "react-device-detect";
import { BlockedTd, CheckTd, Day, HighLightedTd } from "./styled";

const App = (props) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [focusedInput, setFocusedInput] = useState("startDate");
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [currentDate, setCurrentDate] = useState(Moment());
  const [initialLoad, setInitialLoad] = useState(true);
  const { onClickItem } = props.config;

  useEffect(() => {
    Moment.locale("fr");
    loadItems();
    setInitialLoad(false);
  }, []);

  const handleDatesChange = ({ startDate, endDate }) => {
    // Check if the selected range includes any blocked dates
    const isRangeOverBlockedDates = items.some(
      ({ start, end }) =>
        Moment(start).isBetween(startDate, endDate, "D", "[)") ||
        Moment(end).isBetween(startDate, endDate, "D", "(]")
    );

    if (isRangeOverBlockedDates) {
      // Adjust the start and end dates to prevent spanning over blocked dates
      setStartDate(null);
      setEndDate(null);
    } else {
      // No blocked dates in the selected range, set the dates as usual
      setStartDate(startDate);
      setEndDate(endDate);
    }
  };

  const isOutsideRange = (day) => {
    if (Moment().startOf("day") > day.startOf("day")) {
      return true;
    }
    if (startDate && !endDate) {
      const closest = findClosestDate(startDate);
      return closest ? day.isAfter(closest) : closest;
    } else {
      return false;
    }
  };
  const findClosestDate = (date) => {
    let closest = date;
    items.forEach((element) => {
      const start = element.start;
      const startDate = Moment(start, "YYYY-MM-DD HH:mm:ss");
      if (startDate.startOf("day").format() == date.startOf("day").format()) {
        closest = startDate;
      } else if (
        startDate &&
        startDate.isAfter(date) &&
        startDate.isBefore(closest)
      ) {
        closest = startDate;
      } else if (startDate.isAfter(date) && closest == date) {
        closest = startDate;
      }
    });
    return date == closest ? false : closest;
  };

  const setDateRange = () => {
    if (startDate && endDate) {
      props.config.onSetDateRange(startDate, endDate);
    } else {
      props.config.onSetDateRangeFailed("please select date range!");
    }
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

  return (
    <LoadingOverlay active={!isLoaded} spinner>
      <div className={"container-date-range"}>
        {!initialLoad && (
          <DayPickerRangeController
            disabled={!isLoaded}
            startDate={startDate}
            endDate={endDate}
            onDatesChange={handleDatesChange}
            focusedInput={focusedInput}
            onFocusChange={(focusedInput) => onFocusChange(focusedInput)}
            renderCalendarDay={({ day, modifiers, ...props }) => {
              const blockedData = items.filter(({ start, end, color }) =>
                day && day.isBetween(Moment(start), Moment(end), "D", "()")
                  ? { start, end, color }
                  : null
              );

              const isOutsideDay = day && day.isBefore(Moment());

              if (blockedData.length > 0) {
                return blockedData.map(({ start, end, color, ...rest }) => (
                  <BlockedTd
                    key={`${start}-${end}`}
                    daySize={props.daySize}
                    color={color}
                    blocked={true}
                    isOutsideDay={isOutsideDay}
                    onClick={() => onClickItem({ start, end, color, ...rest })}
                    style={{ width: props.daySize, height: props.daySize }}
                  >
                    <Day daySize={props.daySize}>
                      <span>{day && day.format("D")}</span>
                    </Day>
                  </BlockedTd>
                ));
              }
              const matchingStartData = items.find(
                ({ start }) => day && day.isSame(Moment(start), "D")
              );
              const matchingEndData = items.find(
                ({ end }) => day && day.isSame(Moment(end), "D")
              );

              if (matchingStartData && matchingEndData) {
                const color1 = matchingStartData.color;
                const color2 = matchingEndData.color;

                return (
                  <HighLightedTd
                    key={`${matchingStartData.start}-${matchingEndData.end}`}
                    daySize={props.daySize}
                    color1={color1}
                    color2={color2}
                    isOutsideDay={isOutsideDay}
                    onClick={(event) => {
                      // Get the dimensions of the element
                      const rect = event.target.getBoundingClientRect();

                      // Calculate the horizontal position of the click relative to the element
                      const clickX = event.clientX - rect.left;

                      // Compare with the width to determine which half was clicked
                      const isLeftHalf = clickX <= rect.width / 2;
                      // Now you can perform different actions based on which half was clicked
                      if (isLeftHalf) {
                        onClickItem(matchingEndData);
                      } else {
                        onClickItem(matchingStartData);
                      }
                    }}
                    style={{ width: props.daySize, height: props.daySize }}
                  >
                    <Day daySize={props.daySize}>
                      <span>{day && day.format("D")}</span>
                    </Day>
                  </HighLightedTd>
                );
              }
              const matchingData = items.find(
                ({ start, end }) =>
                  (day && day.isSame(Moment(start), "D")) ||
                  (day && day.isSame(Moment(end), "D"))
              );
              if (matchingData) {
                // Determine if it's the start or end date
                const isStartDate =
                  day && day.isSame(Moment(matchingData.start), "D");
                const selectedStart =
                  modifiers && modifiers.has("selected-start");
                const selectedEnd = modifiers && modifiers.has("selected-end");
                // Map CheckTd components for matching data where checkIn is true
                return (
                  <CheckTd
                    key={matchingData.start}
                    daySize={props.daySize}
                    color={matchingData.color}
                    checkIn={isStartDate}
                    isOutsideDay={isOutsideDay}
                    style={{ width: props.daySize, height: props.daySize }}
                    onClick={(event) => {
                      // Get the dimensions of the element
                      const rect = event.target.getBoundingClientRect();

                      // Calculate the horizontal position of the click relative to the element
                      const clickX = event.clientX - rect.left;

                      // Compare with the width to determine which half was clicked
                      const isLeftHalf = clickX <= rect.width / 2;
                      // Now you can perform different actions based on which half was clicked
                      if (isLeftHalf && matchingEndData) {
                        onClickItem(matchingEndData);
                      } else if (!isLeftHalf && matchingStartData) {
                        onClickItem(matchingStartData);
                      } else {
                        props.onDayClick &&
                          props.onDayClick(day || Moment(), event);
                      }
                    }}
                    selectedStart={selectedStart}
                    selectedEnd={selectedEnd}
                    onMouseEnter={(event) =>
                      props.onDayMouseEnter &&
                      props.onDayMouseEnter(day || Moment(), event)
                    }
                    onMouseLeave={(event) =>
                      props.onDayMouseLeave &&
                      props.onDayMouseLeave(day || Moment(), event)
                    }
                  >
                    <Day daySize={props.daySize}>
                      <span>{day && day.format("D")}</span>
                    </Day>
                  </CheckTd>
                );
              }

              return <CalendarDay day={day} modifiers={modifiers} {...props} />;
            }}
            numberOfMonths={isMobile ? 1 : 3}
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
            renderCalendarInfo={() => {
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
            }}
          />
        )}
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
