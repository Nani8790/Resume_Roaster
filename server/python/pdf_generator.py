#!/usr/bin/env python3
"""
PDF Report Generator for Resume Analysis
Generates professional PDF reports using reportlab
"""

import sys
import json
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics import renderPDF

def get_score_color(score):
    """Get color based on score"""
    if score >= 80:
        return HexColor('#10B981')  # Green
    elif score >= 60:
        return HexColor('#F59E0B')  # Yellow
    else:
        return HexColor('#EF4444')  # Red

def get_score_label(score):
    """Get label based on score"""
    if score >= 80:
        return 'EXCELLENT'
    elif score >= 60:
        return 'GOOD'
    else:
        return 'NEEDS IMPROVEMENT'

def create_header_section(story, styles, data):
    """Create the header section of the PDF"""
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=12,
        alignment=TA_CENTER,
        textColor=HexColor('#667eea')
    )
    
    story.append(Paragraph("Resume Analysis Report", title_style))
    story.append(Paragraph("Professional Analysis by Resume Roaster", styles['Normal']))
    
    # Document info
    info_data = [
        ['File Name:', data.get('fileName', 'N/A')],
        ['Analysis Date:', datetime.fromisoformat(data.get('analysisDate', datetime.now().isoformat()).replace('Z', '+00:00')).strftime('%B %d, %Y')],
        ['Analysis Type:', 'Pro Analysis with Job Matching']
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(Spacer(1, 20))
    story.append(info_table)
    story.append(Spacer(1, 30))

def create_score_section(story, styles, data):
    """Create the score overview section"""
    overall_score = data.get('overallScore', 0)
    job_match_score = data.get('jobMatchScore', 0)
    
    # Score summary
    score_style = ParagraphStyle(
        'ScoreStyle',
        parent=styles['Heading2'],
        fontSize=18,
        alignment=TA_CENTER,
        textColor=get_score_color(overall_score)
    )
    
    story.append(Paragraph(f"Overall ATS Score: {overall_score}/100", score_style))
    story.append(Paragraph(f"Status: {get_score_label(overall_score)}", styles['Normal']))
    
    if job_match_score > 0:
        job_score_style = ParagraphStyle(
            'JobScoreStyle',
            parent=styles['Heading2'],
            fontSize=16,
            alignment=TA_CENTER,
            textColor=get_score_color(job_match_score)
        )
        story.append(Spacer(1, 10))
        story.append(Paragraph(f"Job Match Score: {job_match_score}/100", job_score_style))
    
    story.append(Spacer(1, 30))

def create_keyword_analysis(story, styles, data):
    """Create keyword analysis section"""
    keyword_analysis = data.get('keywordAnalysis', {})
    if not keyword_analysis:
        return
    
    story.append(Paragraph("Keyword Analysis", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    # Keywords found
    matched_keywords = keyword_analysis.get('matched', [])
    if matched_keywords:
        story.append(Paragraph("✓ Keywords Found:", styles['Heading3']))
        for keyword in matched_keywords[:10]:  # Limit to 10
            story.append(Paragraph(f"• {keyword}", styles['Normal']))
        story.append(Spacer(1, 12))
    
    # Missing keywords
    missing_keywords = keyword_analysis.get('missing', [])
    if missing_keywords:
        story.append(Paragraph("✗ Missing Critical Keywords:", styles['Heading3']))
        for keyword in missing_keywords[:10]:  # Limit to 10
            story.append(Paragraph(f"• {keyword}", styles['Normal']))
        story.append(Spacer(1, 12))
    
    story.append(Spacer(1, 20))

def create_recommendations_section(story, styles, data):
    """Create recommendations section"""
    recommendations = data.get('recommendations', [])
    if not recommendations:
        return
    
    story.append(Paragraph("Key Recommendations", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    for i, rec in enumerate(recommendations[:8], 1):  # Limit to 8 recommendations
        rec_text = rec if isinstance(rec, str) else str(rec)
        story.append(Paragraph(f"{i}. {rec_text}", styles['Normal']))
        story.append(Spacer(1, 6))
    
    story.append(Spacer(1, 20))

def create_strengths_section(story, styles, data):
    """Create strengths section"""
    strengths = data.get('strengths', [])
    if not strengths:
        return
    
    story.append(Paragraph("Key Strengths", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    for strength in strengths[:6]:  # Limit to 6 strengths
        story.append(Paragraph(f"• {strength}", styles['Normal']))
        story.append(Spacer(1, 4))
    
    story.append(Spacer(1, 20))

def create_critical_issues_section(story, styles, data):
    """Create critical issues section"""
    critical_issues = data.get('criticalIssues', [])
    if not critical_issues:
        return
    
    story.append(Paragraph("Critical Issues to Address", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    for issue in critical_issues[:6]:  # Limit to 6 issues
        story.append(Paragraph(f"⚠ {issue}", styles['Normal']))
        story.append(Spacer(1, 4))
    
    story.append(Spacer(1, 20))

def create_skills_gap_section(story, styles, data):
    """Create skills gap section"""
    skills_gap = data.get('skillsGap', {})
    missing_skills = skills_gap.get('missing', [])
    
    if not missing_skills:
        return
    
    story.append(Paragraph("Skills Gap Analysis", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("Missing Skills:", styles['Heading3']))
    for skill in missing_skills[:8]:  # Limit to 8 skills
        story.append(Paragraph(f"• {skill}", styles['Normal']))
        story.append(Spacer(1, 4))
    
    story.append(Spacer(1, 20))

def create_footer_section(story, styles):
    """Create footer section"""
    story.append(PageBreak())
    
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_CENTER,
        textColor=HexColor('#666666')
    )
    
    story.append(Spacer(1, 50))
    story.append(Paragraph("This report was generated by Resume Roaster", footer_style))
    story.append(Paragraph("Professional Resume Analysis Tool", footer_style))
    story.append(Spacer(1, 20))
    story.append(Paragraph("For more detailed analysis and personalized recommendations,", footer_style))
    story.append(Paragraph("visit our platform at resumeroaster.com", footer_style))

def generate_pdf_report(data, output_path):
    """Generate the complete PDF report"""
    try:
        # Create document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Get styles
        styles = getSampleStyleSheet()
        
        # Customize styles
        styles['Heading1'].fontSize = 18
        styles['Heading1'].textColor = HexColor('#374151')
        styles['Heading2'].fontSize = 14
        styles['Heading2'].textColor = HexColor('#4B5563')
        styles['Heading2'].spaceAfter = 6
        styles['Heading3'].fontSize = 12
        styles['Heading3'].textColor = HexColor('#6B7280')
        styles['Normal'].fontSize = 10
        styles['Normal'].spaceAfter = 4
        
        # Build story
        story = []
        
        # Add sections
        create_header_section(story, styles, data)
        create_score_section(story, styles, data)
        create_keyword_analysis(story, styles, data)
        create_recommendations_section(story, styles, data)
        create_strengths_section(story, styles, data)
        create_critical_issues_section(story, styles, data)
        create_skills_gap_section(story, styles, data)
        create_footer_section(story, styles)
        
        # Build PDF
        doc.build(story)
        
        return True, "PDF generated successfully"
        
    except Exception as e:
        return False, f"Error generating PDF: {str(e)}"

def main():
    """Main function to handle command line arguments"""
    if len(sys.argv) != 3:
        print(json.dumps({
            "success": False,
            "error": "Usage: python pdf_generator.py <input_json_file> <output_pdf_file>"
        }))
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    try:
        # Read input data
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Generate PDF
        success, message = generate_pdf_report(data, output_file)
        
        if success:
            # Get file size
            file_size = os.path.getsize(output_file)
            print(json.dumps({
                "success": True,
                "message": message,
                "output_file": output_file,
                "file_size": file_size
            }))
        else:
            print(json.dumps({
                "success": False,
                "error": message
            }))
            sys.exit(1)
            
    except FileNotFoundError:
        print(json.dumps({
            "success": False,
            "error": f"Input file not found: {input_file}"
        }))
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(json.dumps({
            "success": False,
            "error": f"Invalid JSON in input file: {str(e)}"
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": f"Unexpected error: {str(e)}"
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()