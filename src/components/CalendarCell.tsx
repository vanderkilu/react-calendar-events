import React, { useRef } from "react";
import styled from "styled-components";
import { IPosition, IEvent } from "../types";
import { ID } from "../utils";

const CellContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
`;
const StyledCell = styled.div<{ isToday: boolean }>`
  height: 10rem;
  position: relative;
  background-color: ${props => (props.isToday ? "#c8e6c9" : "transparent")};
  border: 1px solid #f3f4f9;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-direction: column;
  padding-top: 0.5rem;
`;
const CellText = styled.p`
  position: absolute;
  right: 1rem;
  top: 0.2rem;
  font-size: 1.7rem;
  color: "#b8bac3";
`;
export const CellEvent = styled.div`
  padding: 0.5rem;
  border-radius: 2px;
  background-color: #e8f5e9;
  font-size: 1rem;
  color: #81c784;
  margin-bottom: 0.5rem;
  cursor: pointer;
`;
const CellManyEvent = styled.div`
  color: "#b8bac3";
  font-size: 1.1rem;
  width: 100%;
  cursor: pointer;
`;
interface ICell {
  day: number;
  passed: boolean;
  dateStr: string;
  events: IEvent[];
}

interface CalendarCellProps {
  days: Array<ICell>;
  today: number;
  onClick: (dayStr: string, position?: IPosition) => void;
  onCellEventClick: (id: string) => void;
  onOverflowClick: (e: ChangeEventType, dateStr: string) => void;
  onDragStart: (e: DragEventType, id: string) => void;
  onDrop: (e: DragEventType, dateStr: string) => void;
  onDragOver: (e: DragEventType) => void;
}

interface CellProps {
  eventItem: ICell;
  onClick: (passed: boolean, dateStr: string, position?: IPosition) => void;
  today: number;
  onCellEventClick: (id: string) => void;
  onOverflowClick: (e: ChangeEventType, dateStr: string) => void;
  onDragStart: (e: DragEventType, id: string) => void;
  onDrop: (e: DragEventType, dateStr: string) => void;
  onDragOver: (e: DragEventType) => void;
}
type ChangeEventType = React.MouseEvent<HTMLDivElement, MouseEvent>;
type DragEventType = React.DragEvent<HTMLDivElement>;

export const Cell: React.FC<CellProps> = ({
  eventItem,
  today,
  onClick,
  onCellEventClick,
  onOverflowClick,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const { day, passed, dateStr, events } = eventItem;
  const cellRef = useRef<HTMLDivElement>(null);

  const handleClick = (passed: boolean, dateStr: string) => {
    const position = cellRef.current && cellRef.current.getBoundingClientRect();
    if (position) {
      onClick(passed, dateStr, position);
    } else {
      onClick(passed, dateStr);
    }
  };
  const hasEvent = events && events.length > 0;
  const isManyEvents = events && events.length > 3;
  const newEvents = isManyEvents ? events.slice(0, 3) : events;
  const overDue = events.length - 3;

  const handleOnEventCellClick = (e: ChangeEventType, id: string) => {
    onCellEventClick(id);
    e.stopPropagation();
  };
  const handleOnDrop = (e: DragEventType, dateStr: string, passed: boolean) => {
    if (passed) return;
    onDrop(e, dateStr);
  };

  return (
    <StyledCell
      ref={cellRef}
      key={ID()}
      isToday={day === today}
      onClick={() => handleClick(passed, dateStr)}
      onDrop={(e: DragEventType) => handleOnDrop(e, eventItem.dateStr, passed)}
      onDragOver={(e: DragEventType) => onDragOver(e)}
    >
      {!passed && <CellText>{day}</CellText>}
      {hasEvent &&
        newEvents.map(event => (
          <CellEvent
            onClick={(e: ChangeEventType) =>
              handleOnEventCellClick(e, event.id)
            }
            draggable="true"
            onDragStart={(e: DragEventType) => onDragStart(e, event.id)}
            key={ID()}
          >
            {event && event.task && event.task.name}
          </CellEvent>
        ))}
      {isManyEvents && (
        <CellManyEvent
          onClick={(e: ChangeEventType) => onOverflowClick(e, dateStr)}
        >
          +{overDue}
        </CellManyEvent>
      )}
    </StyledCell>
  );
};

const CalendarCell: React.FC<CalendarCellProps> = ({
  days,
  today,
  onClick,
  onCellEventClick,
  onOverflowClick,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const handleClick = (
    passed: boolean,
    dateStr: string,
    position?: IPosition
  ) => {
    if (passed) return null;
    onClick(dateStr, position);
  };

  return (
    <>
      <CellContainer>
        {days.map(eventItem => (
          <Cell
            eventItem={eventItem}
            today={today}
            onClick={handleClick}
            key={ID()}
            onCellEventClick={onCellEventClick}
            onOverflowClick={onOverflowClick}
            onDragStart={onDragStart}
            onDrop={onDrop}
            onDragOver={onDragOver}
          />
        ))}
      </CellContainer>
    </>
  );
};

export default CalendarCell;
