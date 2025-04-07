import {
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { previousDay } from "date-fns";
import { DateTime } from "luxon";
import { DatesService } from "src/shared/services/dates-service/dates.service";

@Component({
  selector: "app-calendar-picker",
  templateUrl: "./calendar-picker.component.html",
  styleUrls: ["./calendar-picker.component.scss"],
})
export class CalendarPickerComponent implements OnInit, OnChanges {
  @Input() selectedDates: DateTime[] = [];
  @Input() lowerLimit?: DateTime;
  @Input() upperLimit?: DateTime;
  @Input() editable: boolean = true;

  @Output() selectedDatesChange = new EventEmitter<DateTime[]>();
  @Output() dateSelected = new EventEmitter<DateTime>();

  currentMonth!: DateTime;
  calendarDays: DateTime[] = [];
  selectedDateMap = new Set<string>();

  dayNames: string[] = [];
  monthNames: string[] = [];

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private datesService: DatesService
  ) {}

  ngOnInit() {
    this.currentMonth = DateTime.now().setLocale(this.locale).startOf("month");
    this.generateDayNames();
    this.generateMonthNames();
    this.generateCalendar();
    this.updateInternalSelectedMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.lowerLimit = this.datesService.ensureDateTime(this.lowerLimit);
    this.upperLimit = this.datesService.ensureDateTime(this.upperLimit);

    if (changes["selectedDates"]) {
      this.selectedDates = this.selectedDates?.map((d) =>
        this.datesService.ensureDateTime(d)
      );
      this.updateInternalSelectedMap();
    }
    // if (changes["lowerLimit"] && !!this.lowerLimit) {
    //   this.lowerLimit = DateTime.fromJSDate(this.lowerLimit as unknown as Date);
    // }

    // if (changes["upperLimit"] && !!this.upperLimit) {
    //   this.upperLimit = DateTime.fromJSDate(this.upperLimit as unknown as Date);
    // }
  }

  private updateInternalSelectedMap() {
    this.selectedDateMap.clear();
    this.selectedDates?.forEach((date) => {
      this.selectedDateMap.add(date.toISODate());
    });
  }

  generateDayNames() {
    const baseDate = DateTime.fromObject(
      { year: 2020, month: 6, day: 7 },
      { locale: this.locale }
    ); // Sunday
    this.dayNames = Array.from({ length: 7 }, (_, i) =>
      baseDate.plus({ days: i }).toFormat("ccc")
    );
  }

  generateMonthNames() {
    const baseDate = DateTime.fromObject({ year: 2020, month: 1, day: 1 });
    this.monthNames = Array.from({ length: 12 }, (_, i) =>
      baseDate.plus({ months: i }).setLocale(this.locale).toFormat("LLLL")
    );
  }

  generateCalendar() {
    this.calendarDays = [];

    const startOfMonth = this.currentMonth.startOf("month");
    const endOfMonth = this.currentMonth.endOf("month");
    const startWeekday = startOfMonth.weekday % 7; // Luxon: 1 (Mon) to 7 (Sun)

    for (let i = startWeekday - 1; i >= 0; i--) {
      this.calendarDays.push(startOfMonth.minus({ days: i + 1 }));
    }

    const daysInMonth = endOfMonth.day;
    for (let i = 0; i < daysInMonth; i++) {
      this.calendarDays.push(startOfMonth.plus({ days: i }));
    }

    while (this.calendarDays.length % 7 !== 0) {
      const last = this.calendarDays[this.calendarDays.length - 1];
      this.calendarDays.push(last.plus({ days: 1 }));
    }
  }

  toggleDate(date: DateTime) {
    if (!this.editable || !this.isWithinLimits(date)) return;

    const iso = date.toISODate();
    this.selectedDateMap.has(iso)
      ? this.selectedDateMap.delete(iso)
      : this.selectedDateMap.add(iso);

    const newSelection = Array.from(this.selectedDateMap).map((d) =>
      DateTime.fromISO(d)
    );
    this.selectedDatesChange.emit(newSelection);
    this.dateSelected.emit(date);
  }

  isSelected(date: DateTime): boolean {
    return this.selectedDateMap.has(date.toISODate());
  }

  isDisabled(date: DateTime): boolean {
    return !this.isWithinLimits(date) || !this.editable;
  }

  isWithinLimits(date: DateTime): boolean {
    if (
      this.lowerLimit &&
      DateTime.isDateTime(this.lowerLimit) &&
      date < this.lowerLimit.startOf("day")
    ) {
      return false;
    }
    if (
      this.upperLimit &&
      DateTime.isDateTime(this.upperLimit) &&
      date > this.upperLimit.startOf("day")
    ) {
      return false;
    }
    return true;
  }

  goToPreviousMonth() {
    this.currentMonth = this.currentMonth.minus({ months: 1 });
    this.generateCalendar();
  }

  goToNextMonth() {
    this.currentMonth = this.currentMonth.plus({ months: 1 });
    this.generateCalendar();
  }

  goToToday() {
    this.currentMonth = DateTime.now().setLocale(this.locale).startOf("month");
    this.generateCalendar();
  }

  canGoToPreviousMonth(): boolean {
    if (!this.lowerLimit) return true;
    const previousMonth = this.currentMonth.minus({ months: 1 });
    return previousMonth.endOf("month") >= this.lowerLimit.startOf("day");
  }

  canGoToNextMonth(): boolean {
    if (!this.upperLimit) return true;
    const nextMonth = this.currentMonth.plus({ months: 1 });
    return nextMonth.startOf("month") <= this.upperLimit.startOf("day");
  }
}
