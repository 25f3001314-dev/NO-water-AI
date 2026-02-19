import pickle

# Path to the uploaded pkl file
pkl_path = 'jal-drishti/weather_model (3).pkl'

try:
    with open(pkl_path, 'rb') as f:
        model = pickle.load(f)
    print('PKL file loaded successfully.')
    print('Type:', type(model))
    print('Preview:', str(model)[:500])
except Exception as e:
    print('Error loading PKL file:', e)
