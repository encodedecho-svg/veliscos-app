import { Clock } from "lucide-react";

interface Props {
  title: string;
  description: string;
  features?: string[];
}

export function AdminComingSoon({ title, description, features }: Props) {
  return (
    <div>
      <div className="admin-header">
        <h2>{title}</h2>
      </div>
      <div className="admin-card">
        <div className="empty-state">
          <Clock size={48} className="empty-state-icon" strokeWidth={1.5} />
          <h3>Coming in Phase 4</h3>
          <p>{description}</p>
          {features && features.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "20px auto 0",
                maxWidth: 360,
                textAlign: "left",
              }}
            >
              {features.map((f) => (
                <li
                  key={f}
                  style={{
                    padding: "8px 14px",
                    background: "#f8f9fa",
                    borderRadius: 8,
                    marginBottom: 6,
                    fontSize: "0.85rem",
                    color: "#666",
                  }}
                >
                  • {f}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
