import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Symptoms.css";

type Symptom = {
  id: string;
  user_id: string;
  symptom_name: string;
  severity: string;
  notes: string | null;
  symptom_date: string;
  created_at: string;
};

export default function Symptoms() {
  const [symptomName, setSymptomName] = useState("");
  const [severity, setSeverity] = useState("Mild");
  const [notes, setNotes] = useState("");

  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSymptoms();
  }, []);

  const loadSymptoms = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const { data, error } = await supabase
      .from("symptoms")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load symptoms error:", error);
      setMessage(error.message);
      return;
    }

    setSymptoms(data || []);
  };

  const saveSymptom = async () => {
    setMessage("");

    if (!symptomName.trim()) {
      setMessage("Please select a symptom.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const symptomData = {
      symptom_name: symptomName.trim(),
      severity,
      notes: notes.trim() || null,
      symptom_date: new Date().toISOString().split("T")[0],
    };

    if (editingId) {
      const { error } = await supabase
        .from("symptoms")
        .update(symptomData)
        .eq("id", editingId)
        .eq("user_id", user.id);

      if (error) {
        console.error("Update symptom error:", error);
        setMessage(error.message);
        return;
      }

      setMessage("Symptom updated successfully!");
    } else {
      const { error } = await supabase
        .from("symptoms")
        .insert({
          user_id: user.id,
          ...symptomData,
        });

      if (error) {
        console.error("Add symptom error:", error);
        setMessage(error.message);
        return;
      }

      setMessage("Symptom added successfully!");
    }

    clearForm();
    loadSymptoms();
  };

  const editSymptom = (symptom: Symptom) => {
    setEditingId(symptom.id);
    setSymptomName(symptom.symptom_name);
    setSeverity(symptom.severity);
    setNotes(symptom.notes || "");
    setMessage("");
  };

  const deleteSymptom = async (id: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this symptom?"
    );

    if (!confirmDelete) {
      return;
    }

    const { error } = await supabase
      .from("symptoms")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Delete symptom error:", error);
      setMessage(error.message);
      return;
    }

    setMessage("Symptom deleted successfully!");
    loadSymptoms();
  };

  const clearForm = () => {
    setSymptomName("");
    setSeverity("Mild");
    setNotes("");
    setEditingId(null);
  };

  const totalSymptoms = symptoms.length;

  

  const quickSymptoms = [
  "Fatigue",
  "Hair Loss",
  "Headache",
  "Dizziness",
  "Skin Problems",
  "Muscle Weakness",
];
return (
  <div className="symptoms-page">

    {/* HEADER */}
    <div className="symptoms-header">
      <div>
        <span className="symptoms-eyebrow">
          HEALTH MONITORING
        </span>

        <h1>Symptoms</h1>

        <p>
          Track symptoms that may be related to your nutrition
          and overall health.
        </p>
      </div>

      <div className="symptoms-header-icon">
        ♥
      </div>
    </div>

   {/* SYMPTOM SUMMARY */}
<div className="symptoms-summary-grid">

  <div className="symptoms-summary-card total">
    <div className="symptoms-summary-icon">+</div>
    <div>
      <span>Total Symptoms</span>
      <strong>{totalSymptoms}</strong>
    </div>
  </div>

  <div className="symptoms-summary-card mild">
    <div className="symptoms-summary-icon">●</div>
    <div>
      <span>Mild</span>
      <strong>
        {symptoms.filter(
          (symptom) => symptom.severity === "Mild"
        ).length}
      </strong>
    </div>
  </div>

  <div className="symptoms-summary-card moderate">
    <div className="symptoms-summary-icon">●</div>
    <div>
      <span>Moderate</span>
      <strong>
        {symptoms.filter(
          (symptom) => symptom.severity === "Moderate"
        ).length}
      </strong>
    </div>
  </div>

  <div className="symptoms-summary-card severe">
    <div className="symptoms-summary-icon">●</div>
    <div>
      <span>Severe</span>
      <strong>
        {symptoms.filter(
          (symptom) => symptom.severity === "Severe"
        ).length}
      </strong>
    </div>
  </div>

</div>

  <div className="symptoms-main-grid">

  {/* LEFT COLUMN */}
  <div className="symptoms-left-column">

    {/* ADD SYMPTOM */}
    <div className="symptoms-form-card">

      <div className="symptoms-section-heading">

        <div className="symptoms-section-icon">
          +
        </div>

        <div>
          <h2>
            {editingId ? "Edit Symptom" : "Add Symptom"}
          </h2>

          <p>
            Record how you are feeling today.
          </p>
        </div>

      </div>

      <div className="symptoms-form-grid">

        <div className="symptoms-field">
          <label>Symptom</label>

          <select
            value={symptomName}
            onChange={(e) =>
              setSymptomName(e.target.value)
            }
          >
            <option value="">Select symptom</option>
            <option value="Fatigue">Fatigue</option>
            <option value="Hair Loss">Hair Loss</option>
            <option value="Skin Problems">
              Skin Problems
            </option>
            <option value="Muscle Weakness">
              Muscle Weakness
            </option>
            <option value="Mood Changes">
              Mood Changes
            </option>
            <option value="Headache">Headache</option>
            <option value="Dizziness">Dizziness</option>
            <option value="Poor Appetite">
              Poor Appetite
            </option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="symptoms-field">
          <label>Severity</label>

          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value)
            }
          >
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>

        <div className="symptoms-field symptoms-notes-field">
          <label>Notes</label>

          <textarea
            placeholder="Optional details about the symptom..."
            value={notes}
            onChange={(e) =>
              setNotes(e.target.value)
            }
            rows={2}
          />
        </div>

      </div>

      {message && (
        <div
          className={
            message.toLowerCase().includes("success")
              ? "symptoms-message symptoms-success"
              : "symptoms-message symptoms-error"
          }
        >
          {message}
        </div>
      )}

      <div className="symptoms-form-actions">

        <button
          type="button"
          className="symptoms-primary-btn"
          onClick={saveSymptom}
        >
          {editingId ? "Update Symptom" : "Add Symptom"}
        </button>

        {editingId && (
          <button
            type="button"
            className="symptoms-secondary-btn"
            onClick={clearForm}
          >
            Cancel
          </button>
        )}

      </div>

    </div>


    {/* QUICK SYMPTOMS */}
    <div className="symptoms-quick-section">

      <div className="symptoms-quick-heading">

        <div>
          <h2>Quick Symptoms</h2>

          <p>
            Select a common symptom to add it quickly.
          </p>
        </div>

      </div>

      <div className="symptoms-quick-list">

        {quickSymptoms.map((item) => (
          <button
            key={item}
            type="button"
            className={
              symptomName === item
                ? "symptoms-quick-chip active"
                : "symptoms-quick-chip"
            }
            onClick={() =>
              setSymptomName(item)
            }
          >
            <span>+</span>
            {item}
          </button>
        ))}

      </div>

    </div>

  </div>


  {/* RIGHT COLUMN */}
  <div className="symptoms-right-column">

    {/* HISTORY */}
    <div className="symptoms-history-card">

      <div className="symptoms-history-header">

        <div>

          <span className="symptoms-eyebrow">
            HEALTH HISTORY
          </span>

          <h2>
            Recorded Symptoms
          </h2>

        </div>

        <span className="symptoms-count">
          {totalSymptoms}{" "}
          {totalSymptoms === 1
            ? "record"
            : "records"}
        </span>

      </div>


      {symptoms.length === 0 ? (

        <div className="symptoms-empty">

          <div className="symptoms-empty-icon">
            ♡
          </div>

          <h3>
            No symptoms recorded yet
          </h3>

          <p>
            Add your first symptom to start monitoring
            your health history.
          </p>

        </div>

      ) : (

        <div className="symptoms-list">

          {symptoms.map((symptom) => {

            const severityClass =
              symptom.severity.toLowerCase();

            return (

              <div
                className="symptoms-entry"
                key={symptom.id}
              >

                <div className="symptoms-entry-main">

                  <div className="symptoms-entry-icon">
                    +
                  </div>

                  <div className="symptoms-entry-info">

                    <h3>
                      {symptom.symptom_name}
                    </h3>

                    <div className="symptoms-entry-meta">

                      <span
                        className={`symptoms-severity symptoms-severity-${severityClass}`}
                      >
                        {symptom.severity}
                      </span>

                      <span>
                        {symptom.symptom_date}
                      </span>

                    </div>

                    {symptom.notes && (
                      <p>
                        {symptom.notes}
                      </p>
                    )}

                  </div>

                </div>


                <div className="symptoms-entry-actions">

                  <button
                    type="button"
                    className="symptoms-edit-btn"
                    onClick={() =>
                      editSymptom(symptom)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="symptoms-delete-btn"
                    onClick={() =>
                      deleteSymptom(symptom.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            );

          })}

        </div>

      )}

    </div>


    {/* INFO */}
    <div className="symptoms-info-box">

      <div className="symptoms-info-icon">
        i
      </div>

      <div>

        <strong>
          Keep your symptoms updated
        </strong>

        <p>
          Regular tracking can help you identify
          changes in your health over time.
        </p>

      </div>

    </div>

  </div>

</div>
</div>

);
}