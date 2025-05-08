try:
    from app.models.project import Project
    from app.models.attack_surface import AttackSurface
    print("Models imported successfully!")
except Exception as e:
    print(f"Error importing models: {e}")
