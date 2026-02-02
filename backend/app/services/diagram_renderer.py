import matplotlib.pyplot as plt
import io
import logging

logger = logging.getLogger(__name__)

class DiagramRenderer:
    @classmethod
    def render_chart(cls, chart_type: str, description: str) -> io.BytesIO:
        """
        Backend renders basic charts using matplotlib based on AI description.
        In a real prod app, you might use specialized libraries for flowcharts (Graphviz).
        """
        try:
            # Simple heuristic for mock data in charts based on description
            # In a full PROD version, another AI call would extract data points
            plt.figure(figsize=(8, 5))
            
            if chart_type == "bar_chart":
                labels = ['Category A', 'Category B', 'Category C', 'Category D']
                values = [45, 70, 55, 90]
                plt.bar(labels, values, color=['#ef0d50', '#eb3a70', '#e5bace', '#10b981'])
                plt.title("Comparative Analysis")
            elif chart_type == "pie_chart":
                labels = ['Share A', 'Share B', 'Share C']
                values = [40, 35, 25]
                plt.pie(values, labels=labels, autopct='%1.1f%%', colors=['#ef0d50', '#eb3a70', '#e5bace'])
                plt.title("Distribution")
            else:
                # Default placeholder for flowchart/timeline if not using graphviz
                plt.text(0.5, 0.5, f"Diagram: {chart_type}\n{description}", 
                         ha='center', va='center', wrap=True)
                plt.axis('off')

            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
            plt.close()
            buf.seek(0)
            return buf
        except Exception as e:
            logger.error(f"Rendering error: {e}")
            return None
