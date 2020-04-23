import React, { useState, useReducer, useEffect } from "react";
import Picker, {
  StyledPickerWrapper,
  StyledPickerGroup
} from "../components/Picker";
import CalendarCell from "../components/CalendarCell";
import CalendarHeader from "../components/CalendarHeader";
import useCalendar from "../hooks/useCalendar";
import { useEvents } from "../contexts/event";
import { ID } from "../utils";
import { IPosition, IEvent, ITask } from "../types";
import FormDetail from "../components/TaskModalFormDetail";
import { Form } from "../components/TaskModalForm";
import TaskModal from "../components/TaskModal";
import { StyledFooter } from "../components/TaskModal";
import Button from "../components/Button";
import useForm from "../hooks/useForm";

import styled from "styled-components";
import moment from "moment";

const StyledCalendarContainer = styled.div`
  padding: 5rem;
`;
const H3 = styled.h3`
  font-size: 1.5rem;
  text-transform: capitalize;
  font-weight: bold;
  color: #212121;
`;

type FormEvent = {
  event: IEvent;
  selectedDate: string;
  isBriefVisible: boolean;
  isDetailVisible: boolean;
};

type FormEventAction =
  | { type: "EVENT"; payload: { event: IEvent } }
  | { type: "SELECTED_DATE"; payload: string }
  | { type: "IS_BRIEF_VISIBLE"; payload: boolean }
  | { type: "IS_DETAIL_VISIBLE"; payload: boolean };

const FormEventInitialState = {
  event: { task: { name: "" }, date: "", id: "" },
  selectedDate: "",
  isBriefVisible: false,
  isDetailVisible: false
};

const FormEventReducer = (state: FormEvent, action: FormEventAction) => {
  switch (action.type) {
    case "EVENT":
      return {
        ...state,
        event: action.payload.event
      };
    case "SELECTED_DATE":
      return {
        ...state,
        selectedDate: action.payload
      };
    case "IS_BRIEF_VISIBLE":
      return {
        ...state,
        isBriefVisible: action.payload
      };
    case "IS_DETAIL_VISIBLE":
      return {
        ...state,
        isDetailVisible: action.payload
      };
    default:
      return state;
  }
};

const HomePage: React.FC<{}> = () => {
  const [date, setDate] = useState(moment());
  const { state, dispatch } = useEvents();

  const [formEvent, setFormEvent] = useReducer(
    FormEventReducer,
    FormEventInitialState
  );
  const [pos, setPos] = useState<IPosition>();

  const initialTask: ITask = {
    name: "",
    duration: ""
  };
  const { values, handleInputChange } = useForm(initialTask);
  const { formattedDays, todayDate } = useCalendar(date, state.events);

  const updateDate = (type: moment.unitOfTime.All, index: number) => {
    setDate(moment(date).set(type, index));
  };
  const handleOnClick = (date: string, position?: IPosition) => {
    setPos(position);
    setFormEvent({ type: "IS_BRIEF_VISIBLE", payload: true });
    setFormEvent({ type: "SELECTED_DATE", payload: date });
  };
  const handleOnSave = (task: ITask) => {
    const event: IEvent = {
      task: task,
      date: formEvent.selectedDate,
      id: ID()
    };
    dispatch({ type: "ADD_EVENT", payload: { event } }); // add event to globale events
    setFormEvent({ type: "EVENT", payload: { event } }); //set the current event
    setFormEvent({ type: "IS_BRIEF_VISIBLE", payload: false });
  };
  const handleOnDetail = () => {
    setFormEvent({ type: "IS_BRIEF_VISIBLE", payload: false });
    setFormEvent({ type: "IS_DETAIL_VISIBLE", payload: true });
  };
  const handleOnEdit = () => {
    setFormEvent({ type: "IS_DETAIL_VISIBLE", payload: false });
  };
  const handleOnDelete = () => {};
  const handleCellEventClick = (id: string) => {
    const currentEvent = state.events.find(event => event.id === id);
    if (currentEvent) {
      setFormEvent({ type: "EVENT", payload: { event: currentEvent } });
    }
    setFormEvent({ type: "IS_DETAIL_VISIBLE", payload: true });
  };

  return (
    <>
      <StyledCalendarContainer>
        <StyledPickerWrapper>
          <H3>task calendar</H3>
          <StyledPickerGroup>
            <Picker date={date} type="month" setDate={updateDate} key={ID()} />
            <Picker date={date} type="year" setDate={updateDate} key={ID()} />
          </StyledPickerGroup>
        </StyledPickerWrapper>
        <CalendarHeader />
        <CalendarCell
          days={formattedDays}
          today={todayDate}
          onClick={handleOnClick}
          onCellEventClick={handleCellEventClick}
        />
      </StyledCalendarContainer>
      <TaskModal
        isOpen={formEvent.isBriefVisible}
        onClose={() =>
          setFormEvent({ type: "IS_BRIEF_VISIBLE", payload: false })
        }
        onSave={() => handleOnSave(values)}
        onDetail={handleOnDetail}
        position={pos}
      >
        <Form task={values} onInputChange={handleInputChange} />
      </TaskModal>
      <TaskModal
        footer={
          <StyledFooter>
            <Button text="Delete" onClick={handleOnDelete} btnType="normal" />
            <Button text="Save" onClick={handleOnEdit} />
          </StyledFooter>
        }
        isOpen={formEvent.isDetailVisible}
        onClose={() =>
          setFormEvent({ type: "IS_DETAIL_VISIBLE", payload: false })
        }
        onSave={() => null}
        onDetail={() => null}
      >
        <FormDetail task={values} onInputChange={handleInputChange} />
      </TaskModal>
    </>
  );
};

export default HomePage;
