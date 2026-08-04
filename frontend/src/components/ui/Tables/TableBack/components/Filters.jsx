/** Filter panel: add/edit filter chips and conditions for TableBack. */
import { useEffect, useRef, useState } from "react";
import { FilterFilled } from "../../../../../icons";
import { conditionsLabels } from "../../../../../utils";
import { DateInput } from "../../../../forms";
import { Box } from "../../../Box";
import { Button } from "../../../Button";
import styles from "../Table.module.css";

const conditionsMap = {
  string: ["contains", "is"],
  number: ["is", "gt", "lt"],
  boolean: ["is"],
};

export const Filters = ({
  appliedFilters,
  setAppliedFilters,
  filters,
  cleanAllFilters = () => {},
}) => {
  if (
    !filters ||
    typeof filters !== "object" ||
    Object.keys(filters).length === 0
  )
    return null;

  const hasVisibleFilter = Object.values(filters).some(
    (f) => f?.component !== "hidden",
  );
  if (!hasVisibleFilter) return null;

  const buttonRef = useRef();
  const [open, setOpen] = useState(false);
  const [barrelFiltersToApply, setBarrelFiltersToApply] =
    useState(appliedFilters);

  useEffect(() => {
    setBarrelFiltersToApply(appliedFilters);
  }, [appliedFilters]);

  const applyFilters = () => {
    setAppliedFilters(barrelFiltersToApply);
    setOpen(false);
  };

  const clearOne = (key) => {
    setBarrelFiltersToApply((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateFilter = (key, value, condition, back_attribute, type) => {
    if (
      value === null ||
      value === "" ||
      value === "null" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      clearOne(key);
      return;
    }
    setBarrelFiltersToApply((prev) => ({
      ...prev,
      [key]: {
        value,
        condition: condition || prev[key]?.condition,
        back_attribute,
        type,
      },
    }));
  };

  return (
    <Box
      className="tableback-filters-wrap"
      style={{ position: "relative" }}
      ref={buttonRef}
    >
      <button
        type="button"
        className="tableback-filter-btn"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        testId="filter-button"
      >
        <span className="tableback-filter-icon" aria-hidden>
          <FilterFilled width={14} height={16} color="var(--color-primary)" />
        </span>
        Filtrar
      </button>
      {open && (
        <>
          <Box
            className="tableback-modal-bg"
            style={{ position: "fixed", inset: 0, zIndex: 12999 }}
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <Box className="tableback-filters-panel">
            <Box className="tableback-filters-panel-body">
              {Object.keys(filters).map((key) => {
                const filter = filters[key];
                if (filter?.component === "hidden") return null;

                if (filter?.component === "active_status_switch") {
                  const raw = barrelFiltersToApply[key];
                  const binary = filter.inactiveWhenOff === true;
                  const isOn = binary
                    ? raw?.value !== undefined && raw?.value !== null
                      ? raw.value === true || raw.value === "true"
                      : filter.default_value === true
                    : raw?.value === true;

                  return (
                    <Box
                      key={key}
                      style={{
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {filter?.label ?? key}
                      </span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isOn}
                        aria-label={filter?.label ?? key}
                        onClick={() => {
                          if (binary) {
                            const current =
                              raw?.value !== undefined && raw?.value !== null
                                ? raw.value === true || raw.value === "true"
                                : filter.default_value === true;
                            updateFilter(
                              key,
                              !current,
                              "is",
                              filter.back_attribute,
                              "boolean",
                            );
                          } else if (isOn) {
                            clearOne(key);
                          } else {
                            updateFilter(
                              key,
                              true,
                              "is",
                              filter.back_attribute,
                              "boolean",
                            );
                          }
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                        }}
                        testId={`filter-switch-${key}`}
                      >
                        <div className={styles["table-actions-switch"]}>
                          <div
                            className={
                              isOn
                                ? `${styles["table-actions-switch-track"]} ${styles["table-actions-switch-track--on"]}`
                                : `${styles["table-actions-switch-track"]} ${styles["table-actions-switch-track--off"]}`
                            }
                          >
                            <div
                              className={styles["table-actions-switch-thumb"]}
                            />
                          </div>
                        </div>
                      </button>
                    </Box>
                  );
                }

                if (filter?.component === "active_status") {
                  const raw = barrelFiltersToApply[key];
                  const sel =
                    raw === undefined ||
                    raw?.value === undefined ||
                    raw?.value === null
                      ? "all"
                      : raw.value === true || raw.value === "true"
                        ? "active"
                        : "inactive";
                  return (
                    <Box key={key} style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {filter?.label ?? key}
                      </label>
                      <select
                        value={sel}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "all") {
                            clearOne(key);
                            return;
                          }
                          updateFilter(
                            key,
                            v === "active",
                            "is",
                            filter.back_attribute,
                            "boolean",
                          );
                        }}
                        style={{
                          width: "100%",
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          background: "var(--container-background)",
                          color: "var(--color-text)",
                        }}
                        testId={`filter-select-active-status-${key}`}
                      >
                        <option value="all">Todos</option>
                        <option value="active">Solo activos</option>
                        <option value="inactive">Solo inactivos</option>
                      </select>
                    </Box>
                  );
                }

                if (filter?.component === "select_multiple") {
                  const raw = barrelFiltersToApply[key];
                  const selectedIds = Array.isArray(raw?.value)
                    ? raw.value.map(String)
                    : [];
                  const options = filter.options ?? [];
                  return (
                    <Box key={key} style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {filter?.label ?? key}
                      </label>
                      <select
                        multiple
                        value={selectedIds}
                        onChange={(e) => {
                          const next = Array.from(e.target.selectedOptions).map(
                            (opt) => {
                              const num = Number(opt.value);
                              return Number.isFinite(num) ? num : opt.value;
                            },
                          );
                          if (next.length === 0) {
                            clearOne(key);
                            return;
                          }
                          updateFilter(
                            key,
                            next,
                            "in",
                            filter.back_attribute,
                            filter.type ?? "number",
                          );
                        }}
                        style={{
                          width: "100%",
                          minHeight: 96,
                          padding: "8px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          background: "var(--container-background)",
                          color: "var(--color-text)",
                        }}
                        testId={`filter-select-multiple-${key}`}
                      >
                        {options.map((opt) => (
                          <option
                            key={String(opt.value)}
                            value={String(opt.value)}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Box>
                  );
                }

                if (filter?.component === "select") {
                  const raw = barrelFiltersToApply[key];
                  const val = raw?.value;
                  const strVal =
                    val === undefined || val === null || val === ""
                      ? ""
                      : String(val);
                  const selectStyle = {
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid var(--color-border)",
                    background: "var(--container-background)",
                    color: "var(--color-text)",
                  };
                  return (
                    <Box key={key} style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          display: "block",
                          marginBottom: 4,
                        }}
                      >
                        {filter?.label ?? key}
                      </label>
                      <select
                        value={strVal}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") {
                            clearOne(key);
                            return;
                          }
                          const num = Number(v);
                          updateFilter(
                            key,
                            Number.isFinite(num) ? num : v,
                            "is",
                            filter.back_attribute,
                            filter.type ?? "number",
                          );
                        }}
                        style={selectStyle}
                        testId={`filter-select-${key}`}
                      >
                        <option value="">Todos</option>
                        {(filter.options ?? []).map((opt) => (
                          <option
                            key={String(opt.value)}
                            value={String(opt.value)}
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Box>
                  );
                }

                if (filter?.type === "date-range") {
                  const raw = barrelFiltersToApply[key];
                  const from = raw?.value?.from ?? "";
                  const to = raw?.value?.to ?? "";
                  const setDateRange = (nextFrom, nextTo) => {
                    if (!nextFrom && !nextTo) {
                      clearOne(key);
                      return;
                    }
                    setBarrelFiltersToApply((prev) => ({
                      ...prev,
                      [key]: {
                        value: { from: nextFrom, to: nextTo },
                        condition: "is",
                        back_attribute: filter.back_attribute,
                        type: "date-range",
                      },
                    }));
                  };
                  return (
                    <Box key={key} style={{ marginBottom: 12 }}>
                      <label
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          display: "block",
                          marginBottom: 8,
                        }}
                      >
                        {filter?.label ?? key}
                      </label>
                      <Box
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        <DateInput
                          label="Desde"
                          value={from}
                          onChange={(e) => setDateRange(e.target.value, to)}
                          placeholder="dd/mm/aaaa"
                        />
                        <DateInput
                          label="Hasta"
                          value={to}
                          onChange={(e) => setDateRange(from, e.target.value)}
                          placeholder="dd/mm/aaaa"
                        />
                      </Box>
                    </Box>
                  );
                }

                const val = barrelFiltersToApply[key]?.value ?? "";
                const cond =
                  barrelFiltersToApply[key]?.condition ??
                  filter?.condition ??
                  (filter?.type === "string" ? "contains" : "is");
                const conditions =
                  conditionsMap[filter?.type] || conditionsMap.string;
                return (
                  <Box key={key} style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {filter?.label ?? key}
                    </label>
                    <Box style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <select
                        value={cond}
                        onChange={(e) =>
                          updateFilter(
                            key,
                            val,
                            e.target.value,
                            filter?.back_attribute,
                            filter?.type,
                          )
                        }
                        style={{
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                          minWidth: 100,
                        }}
                        testId={`filter-select-condition-${key}`}
                      >
                        {conditions.map((c) => (
                          <option key={c} value={c}>
                            {conditionsLabels[c] ?? c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) =>
                          updateFilter(
                            key,
                            e.target.value,
                            cond,
                            filter?.back_attribute,
                            filter?.type,
                          )
                        }
                        placeholder="Valor"
                        style={{
                          flex: 1,
                          minWidth: 100,
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--color-border)",
                        }}
                        testId={`filter-input-${key}`}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box className="tableback-filters-panel-footer">
              <Button variant="secondary" onClick={cleanAllFilters}>
                Limpiar
              </Button>
              <Button
                variant="primary"
                onClick={applyFilters}
                testId="filters-apply"
              >
                Aplicar
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};
