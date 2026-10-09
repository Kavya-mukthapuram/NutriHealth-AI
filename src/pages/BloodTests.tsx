import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./BloodTests.css";

type BloodTest = {
  id: string;
  user_id: string;
  test_name: string;
  test_value: number;
  unit: string;
  test_date: string;
  notes: string | null;
  created_at: string;
};

export default function BloodTests() {
  const [testName, setTestName] = useState("");
  const [testValue, setTestValue] = useState("");
  const [unit, setUnit] = useState("");
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");

  const [bloodTests, setBloodTests] = useState<BloodTest[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadBloodTests();
  }, []);

  const loadBloodTests = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { data, error } = await supabase
      .from("blood_tests")
      .select("*")
      .eq("user_id", user.id)
      .order("test_date", { ascending: false });

    if (error) {
      console.error("Load blood tests error:", error);
      setMessage(error.message);
      return;
    }

    setBloodTests(data || []);
  };

  const saveBloodTest = async () => {
    if (!testName.trim()) {
      setMessage("Please select a blood test.");
      return;
    }

    if (!testValue || Number(testValue) < 0) {
      setMessage("Please enter a valid test value.");
      return;
    }

    if (!unit.trim()) {
      setMessage("Please enter the unit.");
      return;
    }

    if (!testDate) {
      setMessage("Please select the test date.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const bloodTestData = {
      test_name: testName.trim(),
      test_value: Number(testValue),
      unit: unit.trim(),
      test_date: testDate,
      notes: notes.trim() || null,
    };

    if (editingId) {
      const { error } = await supabase
        .from("blood_tests")
        .update(bloodTestData)
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Update blood test error:", error);
        setMessage(error.message);
        return;
      }

      setMessage("Blood test updated successfully!");
    } else {
      const { error } = await supabase
        .from("blood_tests")
        .insert({
          user_id: user.id,
          ...bloodTestData,
        });

      if (error) {
        console.error("Add blood test error:", error);
        setMessage(error.message);
        return;
      }

      setMessage("Blood test added successfully!");
    }

    clearForm();
    loadBloodTests();
  };

  const editBloodTest = (test: BloodTest) => {
    setEditingId(test.id);
    setTestName(test.test_name);
    setTestValue(String(test.test_value));
    setUnit(test.unit);
    setTestDate(test.test_date);
    setNotes(test.notes || "");
    setMessage("");
  };

  const deleteBloodTest = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this blood test?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("blood_tests")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete blood test error:", error);
      setMessage(error.message);
      return;
    }

    setMessage("Blood test deleted successfully!");
    loadBloodTests();
  };

  const clearForm = () => {
    setTestName("");
    setTestValue("");
    setUnit("");
    setTestDate(new Date().toISOString().split("T")[0]);
    setNotes("");
    setEditingId(null);
  };

  const getTestColor = (name: string) => {
    const value = name.toLowerCase();

    if (value.includes("vitamin d")) {
      return "purple";
    }

    if (value.includes("hemoglobin")) {
      return "pink";
    }

    if (value.includes("b12")) {
      return "green";
    }

    if (value.includes("ferritin") || value.includes("iron")) {
      return "orange";
    }

    if (value.includes("calcium")) {
      return "blue";
    }

    if (value.includes("glucose")) {
      return "red";
    }

    return "blue";
  };

  return (
    <div className="blood-tests-page">

      {/* ================= HEADER ================= */}

      <div className="blood-page-header">
        <div className="blood-header-icon">
          🧪
        </div>

        <div>
          <h1>Blood Tests</h1>

          <p>
            Record and track your laboratory test results
            to monitor your health information.
          </p>
        </div>

        <div className="blood-total-card">
          <span>📅</span>

          <div>
            <small>Total Tests</small>
            <strong>{bloodTests.length}</strong>
            <em>Recorded</em>
          </div>
        </div>
      </div>

      {/* ================= ADD FORM ================= */}

      <section className="blood-form-card">

        <div className="blood-form-heading">
          <div className="blood-form-icon">
            ▣
          </div>

          <div>
            <h2>
              {editingId
                ? "Edit Blood Test"
                : "Add New Blood Test"}
            </h2>

            <p>
              Enter your laboratory test details below.
            </p>
          </div>
        </div>

        <div className="blood-form-grid">

          {/* Test Name */}

          <div className="blood-field">
            <label>Test Name</label>

            <div className="blood-input-wrap purple-input">
              <span>▣</span>

              <select
                value={testName}
                onChange={(e) => {
                  setTestName(e.target.value);

                  const selectedOption =
                    e.target.selectedOptions[0];

                  setUnit(
                    selectedOption.getAttribute(
                      "data-unit"
                    ) || ""
                  );
                }}
              >
                <option value="">
                  Select a test
                </option>

                <option
                  value="Hemoglobin"
                  data-unit="g/dL"
                >
                  Hemoglobin
                </option>

                <option
                  value="Vitamin B12"
                  data-unit="pg/mL"
                >
                  Vitamin B12
                </option>

                <option
                  value="Vitamin D"
                  data-unit="ng/mL"
                >
                  Vitamin D
                </option>

                <option
                  value="Ferritin"
                  data-unit="ng/mL"
                >
                  Ferritin
                </option>

                <option
                  value="Serum Iron"
                  data-unit="µg/dL"
                >
                  Serum Iron
                </option>

                <option
                  value="Calcium"
                  data-unit="mg/dL"
                >
                  Calcium
                </option>

                <option
                  value="Fasting Blood Glucose"
                  data-unit="mg/dL"
                >
                  Fasting Blood Glucose
                </option>

                <option
                  value="Other"
                  data-unit=""
                >
                  Other
                </option>
              </select>
            </div>
          </div>

          {/* Test Value */}

          <div className="blood-field">
            <label>Test Value</label>

            <div className="blood-input-wrap pink-input">
              <span>◉</span>

              <input
                type="number"
                step="0.01"
                placeholder="Enter test value"
                value={testValue}
                onChange={(e) =>
                  setTestValue(e.target.value)
                }
              />
            </div>
          </div>

          {/* Unit */}

          <div className="blood-field">
            <label>Unit</label>

            <div className="blood-input-wrap green-input">
              <span>⌁</span>

              <input
                type="text"
                placeholder="e.g. g/dL, mg/dL, ng/mL"
                value={unit}
                onChange={(e) =>
                  setUnit(e.target.value)
                }
              />
            </div>
          </div>

          {/* Date */}

          <div className="blood-field">
            <label>Test Date</label>

            <div className="blood-input-wrap blue-input">
              <span>▣</span>

              <input
                type="date"
                value={testDate}
                onChange={(e) =>
                  setTestDate(e.target.value)
                }
              />
            </div>
          </div>

          {/* Notes */}

          <div className="blood-field blood-notes-field">
            <label>Notes (Optional)</label>

            <div className="blood-input-wrap orange-input">
              <span>▤</span>

              <textarea
                placeholder="Optional notes about the test"
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
                }
              />
            </div>
          </div>

        </div>

        <div className="blood-form-actions">

          <button
            type="button"
            className="blood-primary-btn"
            onClick={saveBloodTest}
          >
            <span>＋</span>

            {editingId
              ? "Update Blood Test"
              : "Add Blood Test"}
          </button>

          <button
            type="button"
            className="blood-clear-btn"
            onClick={clearForm}
          >
            ×
            <span>Clear Form</span>
          </button>

        </div>

        {message && (
          <div className="blood-message">
            {message}
          </div>
        )}

      </section>

      {/* ================= SUMMARY CARDS ================= */}

      <div className="blood-summary-grid">

        <div className="blood-summary-card purple-summary">
          <div className="summary-icon">◉</div>

          <div>
            <span>Total Tests</span>
            <strong>{bloodTests.length}</strong>
            <small>All recorded tests</small>
          </div>
        </div>

        <div className="blood-summary-card green-summary">
          <div className="summary-icon">✓</div>

          <div>
            <span>Recent Tests</span>
            <strong>
              {bloodTests.filter((test) => {
                const testDate =
                  new Date(test.test_date);

                const now = new Date();

                const difference =
                  now.getTime() -
                  testDate.getTime();

                return (
                  difference <=
                  30 * 24 * 60 * 60 * 1000
                );
              }).length}
            </strong>
            <small>Within last 30 days</small>
          </div>
        </div>

        <div className="blood-summary-card orange-summary">
          <div className="summary-icon">⌁</div>

          <div>
            <span>Test Types</span>
            <strong>
              {
                new Set(
                  bloodTests.map(
                    (test) => test.test_name
                  )
                ).size
              }
            </strong>
            <small>Different tests tracked</small>
          </div>
        </div>

        <div className="blood-summary-card blue-summary">
          <div className="summary-icon">▣</div>

          <div>
            <span>Latest Entry</span>
            <strong>
              {bloodTests.length > 0
                ? bloodTests[0].test_name
                : "—"}
            </strong>
            <small>
              {bloodTests.length > 0
                ? bloodTests[0].test_date
                : "No tests yet"}
            </small>
          </div>
        </div>

      </div>

      {/* ================= HISTORY ================= */}

      <section className="blood-history-card">

        <div className="blood-history-header">

          <div className="history-title">

            <div className="history-icon">
              ♡
            </div>

            <div>
              <h2>Blood Test History</h2>

              <p>
                Your recorded laboratory test results
              </p>
            </div>

          </div>

          <div className="history-count">
            {bloodTests.length}{" "}
            {bloodTests.length === 1
              ? "Test"
              : "Tests"}
          </div>

        </div>

        {bloodTests.length === 0 ? (
          <div className="blood-empty">
            <div>🧪</div>

            <h3>No blood tests recorded yet</h3>

            <p>
              Add your first laboratory result above
              to start tracking your health data.
            </p>
          </div>
        ) : (
          <div className="blood-history-list">

            {bloodTests.map((test) => {

              const color =
                getTestColor(test.test_name);

              return (
                <div
                  className={`blood-history-row ${color}`}
                  key={test.id}
                >

                  {/* Test */}

                  <div className="history-test-info">

                    <div className="history-test-icon">
                      {test.test_name
                        .substring(0, 3)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {test.test_name}
                      </strong>

                      <span>
                        Laboratory Test
                      </span>
                    </div>

                  </div>

                  {/* Result */}

                  <div className="history-result">

                    <small>Result</small>

                    <strong>
                      {test.test_value}{" "}
                      {test.unit}
                    </strong>

                  </div>

                  {/* Date */}

                  <div className="history-date">

                    <small>Date</small>

                    <span>
                      📅 {test.test_date}
                    </span>

                  </div>

                  {/* Actions */}

                  <div className="history-actions">

                    <button
                      type="button"
                      className="history-edit"
                      onClick={() =>
                        editBloodTest(test)
                      }
                    >
                      ✎ Edit
                    </button>

                    <button
                      type="button"
                      className="history-delete"
                      onClick={() =>
                        deleteBloodTest(test.id)
                      }
                    >
                      × Delete
                    </button>

                  </div>

                  {test.notes && (
                    <div className="history-notes">
                      <span>Note:</span>{" "}
                      {test.notes}
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

        {/* Bottom tip */}

        <div className="blood-health-tip">
          <div className="tip-icon">
            ♥
          </div>

          <div>
            <strong>Health Tracking Tip</strong>

            <p>
              Keep your laboratory results updated
              to help monitor changes in your
              nutrition and health information.
            </p>
          </div>
        </div>

      </section>

    </div>
  );
}